import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../user/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { Router } from '@angular/router';
import { WebClient } from 'app/client';

enum LandingState {
    Working,
    WaitingForAction,
    NewPlayer,
    OfflineOnly
}

@Component({
    selector: 'ccg-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
    public states = LandingState;
    public state = LandingState.Working;

    constructor(
        private auth: AuthenticationService,
        private settings: SettingsService,
        private router: Router,
        private client: WebClient
    ) {
        this.init();
    }

    private async init() {
        const serverAvailable = await this.auth.checkServerAvailable();
        if (!serverAvailable) {
            this.state = LandingState.OfflineOnly;
            return;
        }

        const loginOk = await this.auth.attemptLogin();
        if (!loginOk) {
            this.state = LandingState.WaitingForAction;
        }
    }

    public newPlayer() {
        this.state = LandingState.NewPlayer;
    }

    public createGuestAccount() {
        this.state = LandingState.Working;
        this.auth.registerGuest();
    }

    public enterOfflineMode() {
        this.settings.setOffline(true);
        this.client.enterOfflineMode();
        this.router.navigateByUrl('/lobby');
    }

    public ngOnInit() { }
}
