import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../user/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { Router } from '@angular/router';
import { WebClient } from 'app/client';
import { environment } from '../../environments/environment';

enum LandingState {
    Working,
    WaitingForAction,
    NewPlayer,
    OfflineOnly,
    Serverless
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
        if (environment.serverless) {
            this.state = LandingState.Serverless;
            return;
        }

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

    public ngOnInit() {
        // Check for P2P room in URL
        const urlParams = new URLSearchParams(window.location.search);
        const room = urlParams.get('room');
        if (room) {
            console.log('Auto-joining P2P room:', room);
            this.enterOfflineMode(room);
        }
    }

    public enterOfflineMode(autoJoinRoom?: string) {
        this.settings.setOffline(true);
        const needsSetup = this.client.enterOfflineMode();

        if (needsSetup) {
            this.router.navigateByUrl('/initialSetup');
            return;
        }

        if (autoJoinRoom) {
            this.client.openP2PDialog(autoJoinRoom);
        } else {
            this.router.navigateByUrl('/lobby');
        }
    }
}
