import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private isOfflineSubject = new BehaviorSubject<boolean>(false);
    public isOffline$ = this.isOfflineSubject.asObservable();

    constructor() {
        const saved = localStorage.getItem('offlineMode');
        if (saved) {
            this.isOfflineSubject.next(saved === 'true');
        }
    }

    public setOffline(isOffline: boolean) {
        this.isOfflineSubject.next(isOffline);
        localStorage.setItem('offlineMode', String(isOffline));
    }

    public isOffline() {
        return this.isOfflineSubject.value;
    }
}
