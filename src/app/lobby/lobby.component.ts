import { Component, HostListener, OnInit } from '@angular/core';
import { DecksService } from 'app/decks.service';
import { ClientState, WebClient } from '../client';
import { SoundManager } from '../sound';
import { AuthenticationService, UserData } from '../user/authentication.service';

@Component({
    selector: 'ccg-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
    public user: UserData;
    constructor(
        public client: WebClient,
        public decks: DecksService,
        public soundManager: SoundManager,
        public auth: AuthenticationService
    ) {
        if (
            client.getState() !== ClientState.UnAuth &&
            client.getState() !== ClientState.Waiting
        ) {
            client.returnToLobby();
        }

        this.user = auth.getUser() as UserData;
        if (!this.user && this.client.getState() === ClientState.InLobby) {
            this.user = {
                username: 'Offline Player',
                role: 'user',
                token: '',
                mpToken: ''
            };
        }

        if (!this.soundManager.musicIsPlaying()) {
            this.soundManager.setFactionContext(new Set());
        }
    }

    public join() {
        this.client.joinPublicQueue();
    }

    public fullscreen() {
        const fsRequester: any = document.documentElement;
        if (fsRequester.mozRequestFullScreen) {
            fsRequester.mozRequestFullScreen();
        } else if (fsRequester.webkitRequestFullScreen) {
            fsRequester.webkitRequestFullScreen();
        } else if (fsRequester.requestFullscreen) {
            fsRequester.requestFullscreen();
        }
    }

    public showMultiplayer() {
        return this.client.isConnected();
    }

    public inLobby() {
        return this.client.getState() === ClientState.InLobby;
    }

    @HostListener('window:beforeunload')
    public exit() {
        if (this.client.getState() === ClientState.InQueue) {
            this.client.leaveQueue();
        }
        this.client.exitGame(true);
        return null;
    }

    ngOnInit() { }

    public getState() {
        if (!this.client) {
            return 0;
        }
        return this.client.getState();
    }
}
