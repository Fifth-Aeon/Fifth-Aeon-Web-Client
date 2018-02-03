import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { getWsUrl } from '../url';


@Injectable()
export class AuthenticationService {
  private token: string;
  private username: string;
  private authChangeCallbacks: Array<(username: string) => void> = [];

  constructor(private http: HttpClient) {
    try {
      let data = JSON.parse(localStorage.getItem('login'));
      this.setLogin(data.username, data.token);
    } catch (e) { }
  }

  public loggedIn() {
    return this.token !== undefined;
  }

  public logout() {
    this.token = undefined;
    this.username = undefined;
    localStorage.setItem('login', '');
    this.authChangeCallbacks.forEach(callback => callback(null));
  }

  private setLogin(username: string, token: string) {
    this.token = token;
    this.username = username;
    localStorage.setItem('login', JSON.stringify({ token: token, username: username }));
    this.authChangeCallbacks.forEach(callback => callback(username));
  }

  public onAuth(callback: (username: string) => void) {
    this.authChangeCallbacks.push(callback);
    if (this.loggedIn()) {
      callback(this.username);
    }
  }

  public getAuthHeader() {
    return new HttpHeaders({
      token: this.token
    });
  }

  public verifyEmail(emailToken) {
    return this.http.post(`${getWsUrl}/api/auth/verifyEmail`, {}, {
      headers: new HttpHeaders({
        token: emailToken
      })
    }).toPromise();
  }

  public requestPasswordReset(usernameOrEmail: string) {
    return this.http.post(`${getWsUrl}/api/auth/requestReset`, {
      usernameOrEmail: usernameOrEmail
    }).toPromise();
  }

  public resetPassword(restToken, newPassword) {
    return this.http.post(`${getWsUrl}/api/auth/verifyReset`, {
      password: newPassword
    }, {
        headers: new HttpHeaders({
          token: restToken
        })
      })
      .toPromise()
      .then((res: any) => {
        this.setLogin(res.username, res.token);
      });
  }

  public register(username: string, email: string, password: string) {
    return this.http.post(`${getWsUrl}/api/auth/register`, {
      username: username,
      email: email.toLowerCase(),
      password: password
    }).toPromise()
      .then((res: any) => {
        this.setLogin(username, res.token);
      });
  }

  public login(usernameOrEmail: string, password: string) {
    return this.http.post(`${getWsUrl}/api/auth/login`, {
      usernameOrEmail: usernameOrEmail,
      password: password
    }).toPromise()
      .then((res: any) => {
        this.setLogin(res.username, res.token);
      });
  }

}
