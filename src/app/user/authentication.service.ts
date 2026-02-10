import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { apiURL } from '../url';
import { environment } from '../../environments/environment';

export interface UserData {
    token: string;
    username: string;
    mpToken: string;
    role: 'guest' | 'user' | 'mod' | 'admin';
}

interface GuestData extends UserData {
    password: string;
}

@Injectable()
export class AuthenticationService {
    private user: UserData | null = null;
    private authChangeCallbacks: Array<(user: UserData | null) => void> = [];
    private redirectTarget = 'lobby';

    constructor(private http: HttpClient, private router: Router) { }

    public getRole() {
        if (this.user) {
            return this.user.role;
        }
    }

    public async checkServerAvailable() {
        if (environment.serverless) {
            return false;
        }
        try {
            await lastValueFrom(this.http.get(apiURL, { responseType: 'text' }));
            return true;
        } catch (err: any) {
            return err.status !== 0;
        }
    }

    public attemptLogin() {
        if (environment.serverless) {
            return Promise.resolve(false);
        }
        try {
            const rawData = localStorage.getItem('login');
            if (!rawData) {
                return Promise.resolve(false);
            }
            const data = JSON.parse(rawData);
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

    public afterLogin(): Promise<UserData> {
        if (this.user != null) {
            return Promise.resolve(this.user);
        }
        return new Promise(resolve => {
            this.onAuth(user => {
                if (user !== null) {
                    resolve(user);
                }
            });
        });
    }

    public setRedirect(redirect: string) {
        this.redirectTarget = redirect;
    }

    public redirect() {
        console.log('redir to', this.redirectTarget);
        this.router.navigateByUrl('/' + this.redirectTarget);
    }

    public getUser(): UserData | null {
        if (this.user) {
            return { ...this.user };
        }
        return null;
    }

    public gotoLogin() {
        if (localStorage.getItem('madeAccount')) {
            this.router.navigateByUrl('/login');
        } else {
            this.router.navigateByUrl('/register');
        }
    }

    public loggedIn() {
        return this.user !== null;
    }

    public logout() {
        this.user = null;
        localStorage.setItem('login', '');
        this.authChangeCallbacks.forEach(callback => callback(null));
        this.router.navigateByUrl('/');
    }

    public onAuth(callback: (user: UserData | null) => void) {
        this.authChangeCallbacks.push(callback);
        if (this.loggedIn()) {
            callback(this.user);
        }
    }

    public getAuthHeader() {
        if (!this.user) {
            throw new Error('Cannot get auth token for unauthorized user');
        }
        return new HttpHeaders({
            token: this.user.token
        });
    }

    public verifyEmail(emailToken: string) {
        return lastValueFrom(this.http
            .post(
                `${apiURL}/api/auth/verifyEmail`,
                {},
                {
                    headers: new HttpHeaders({
                        token: emailToken
                    })
                }
            ));
    }

    public requestPasswordReset(usernameOrEmail: string) {
        return lastValueFrom(this.http
            .post(`${apiURL}/api/auth/requestReset`, {
                usernameOrEmail: usernameOrEmail
            }));
    }

    public resetPassword(restToken: string, newPassword: string) {
        return lastValueFrom<UserData>(this.http
            .post<UserData>(
                `${apiURL}/api/auth/verifyReset`,
                {
                    password: newPassword
                },
                {
                    headers: new HttpHeaders({
                        token: restToken
                    })
                }
            ))
            .then((res: UserData) => {
                this.setLogin(res);
            });
    }

    public upgradeAccount(username: string, email: string, password: string) {
        return lastValueFrom<UserData>(this.http
            .post<UserData>(
                `${apiURL}/api/auth/upgradeGuest`,
                {
                    username: username,
                    email: email.toLowerCase(),
                    password: password
                },
                { headers: this.getAuthHeader() }
            ))
            .then((res: UserData) => {
                this.setLogin(res);
                localStorage.setItem('madeAccount', 'true');
            });
    }

    public register(username: string, email: string, password: string) {
        return lastValueFrom<UserData>(this.http
            .post<UserData>(`${apiURL}/api/auth/register`, {
                username: username,
                email: email.toLowerCase(),
                password: password
            }))
            .then((res: UserData) => {
                this.setLogin(res);
                localStorage.setItem('madeAccount', 'true');
            });
    }

    public registerGuest() {
        return lastValueFrom<GuestData>(this.http
            .post<GuestData>(`${apiURL}/api/auth/registerGuest`, {}))
            .then((res: GuestData) => {
                this.setRedirect('initialSetup');
                this.setLogin(res);
                localStorage.setItem('madeAccount', 'true');
                localStorage.setItem('guest', res.password);
            });
    }

    public login(usernameOrEmail: string, password: string) {
        return lastValueFrom<UserData>(this.http
            .post<UserData>(`${apiURL}/api/auth/login`, {
                usernameOrEmail: usernameOrEmail,
                password: password
            }))
            .then(res => {
                this.setLogin(res);
            });
    }

    private confirmLogin(token: string): Promise<UserData | null> {
        return lastValueFrom<UserData>(this.http
            .get<UserData>(`${apiURL}/api/auth/userdata`, {
                headers: new HttpHeaders({
                    token: token
                })
            }))
            .then(res => res)
            .catch(err => null);
    }

    private setLogin(user: UserData) {
        this.user = user;
        localStorage.setItem('login', JSON.stringify(user));
        this.authChangeCallbacks.forEach(callback => callback(this.getUser()));
        this.redirect();
    }
}
