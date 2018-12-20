import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { apiURL } from '../url';

export interface UserData {
    token: string;
    username: string;
    mpToken: string;
}

interface GuestData extends UserData {
    password: string;
}

@Injectable()
export class AuthenticationService {
    private user: UserData;
    private authChangeCallbacks: Array<(user: UserData) => void> = [];

    constructor(private http: HttpClient, private router: Router) {}

    public attemptLogin() {
        try {
            const data = JSON.parse(localStorage.getItem('login'));
            return this.confirmLogin(data.token).then(res => {
                if (res) {
                    this.setLogin(res);
                }
                return res !== null;
            });
        } catch (e) {
            return Promise.resolve(false);
        }
    }

    public getUser(): UserData {
        return { ...this.user };
    }

    public gotoLogin() {
        if (localStorage.getItem('madeAccount')) {
            this.router.navigateByUrl('/login');
        } else {
            this.router.navigateByUrl('/register');
        }
    }

    public loggedIn() {
        return this.user !== undefined;
    }

    public logout() {
        this.user = undefined;
        localStorage.setItem('login', '');
        this.authChangeCallbacks.forEach(callback => callback(null));
        this.router.navigateByUrl('/');
    }

    public onAuth(callback: (user: UserData) => void) {
        this.authChangeCallbacks.push(callback);
        if (this.loggedIn()) {
            callback(this.user);
        }
    }

    public getAuthHeader() {
        return new HttpHeaders({
            token: this.user.token
        });
    }

    public verifyEmail(emailToken) {
        return this.http
            .post(
                `${apiURL}/api/auth/verifyEmail`,
                {},
                {
                    headers: new HttpHeaders({
                        token: emailToken
                    })
                }
            )
            .toPromise();
    }

    public requestPasswordReset(usernameOrEmail: string) {
        return this.http
            .post(`${apiURL}/api/auth/requestReset`, {
                usernameOrEmail: usernameOrEmail
            })
            .toPromise();
    }

    public resetPassword(restToken, newPassword) {
        return this.http
            .post(
                `${apiURL}/api/auth/verifyReset`,
                {
                    password: newPassword
                },
                {
                    headers: new HttpHeaders({
                        token: restToken
                    })
                }
            )
            .toPromise()
            .then((res: UserData) => {
                this.setLogin(res);
            });
    }

    public register(username: string, email: string, password: string) {
        return this.http
            .post(`${apiURL}/api/auth/register`, {
                username: username,
                email: email.toLowerCase(),
                password: password
            })
            .toPromise()
            .then((res: UserData) => {
                this.setLogin(res);
                localStorage.setItem('madeAccount', 'true');
            });
    }

    public registerGuest() {
        return this.http
            .post(`${apiURL}/api/auth/registerGuest`, {})
            .toPromise()
            .then((res: GuestData) => {
                this.setLogin(res);
                localStorage.setItem('madeAccount', 'true');
                localStorage.setItem('guest', res.password);
            });
    }

    public login(usernameOrEmail: string, password: string) {
        return this.http
            .post(`${apiURL}/api/auth/login`, {
                usernameOrEmail: usernameOrEmail,
                password: password
            })
            .toPromise()
            .then((res: UserData) => {
                this.setLogin(res);
            });
    }

    private confirmLogin(token: string): Promise<UserData> {
        return this.http
            .get(`${apiURL}/api/auth/userdata`, {
                headers: new HttpHeaders({
                    token: token
                })
            })
            .toPromise()
            .then((res: UserData) => res)
            .catch(err => null);
    }

    private setLogin(user: UserData) {
        this.user = user;
        localStorage.setItem('login', JSON.stringify(user));
        this.authChangeCallbacks.forEach(callback => callback(this.getUser()));
        this.router.navigateByUrl('/lobby');
    }
}
