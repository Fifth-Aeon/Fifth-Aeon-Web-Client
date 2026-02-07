import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AuthenticationService } from 'app/user/authentication.service';
import { apiURL } from 'app/url';

export interface AccountData {
    username: string;
    role: 'guest' | 'user' | 'mod' | 'admin';
    joined: Date;
    lastActive: Date;
}

@Injectable({
    providedIn: 'root'
})
export class AdminDataService {
    private static getUserData = `${apiURL}/api/admin/userData`;
    private static oldAccounts = `${apiURL}/api/admin/oldAccounts`;
    private static getCardData = `${apiURL}/api/admin/cardData`;

    constructor(
        private http: HttpClient,
        private auth: AuthenticationService
    ) { }

    public getCardCounts() {
        return lastValueFrom(this.http.get<{ cardCount: number; publicCardCount: number }>(
            AdminDataService.getCardData,
            {
                headers: this.auth.getAuthHeader()
            }
        ));
    }

    public getUserData() {
        return lastValueFrom(this.http.get<AccountData[]>(AdminDataService.getUserData, {
            headers: this.auth.getAuthHeader()
        }));
    }

    public getOldAccounts() {
        return lastValueFrom(this.http.get<AccountData[]>(AdminDataService.oldAccounts, {
            headers: this.auth.getAuthHeader()
        }));
    }

    public deleteOldAccounts() {
        return lastValueFrom(this.http.delete<AccountData[]>(AdminDataService.oldAccounts, {
            headers: this.auth.getAuthHeader()
        }));
    }
}
