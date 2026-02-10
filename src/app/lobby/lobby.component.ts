import { Component, HostListener, OnInit } from '@angular/core';
import { DecksService } from 'app/decks.service';
import { ClientState, WebClient } from '../client';
import { SoundManager } from '../sound';
import { AuthenticationService, UserData } from '../user/authentication.service';
import { P2PDialogComponent } from './p2p-dialog/p2p-dialog.component';
import { environment } from '../../environments/environment';

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

        // Check for pending P2P join
        if (this.client.pendingP2PRoom) {
            const room = this.client.pendingP2PRoom;
            this.client.pendingP2PRoom = undefined;
            // timeout to ensure view is ready?
            setTimeout(() => this.openP2PDialog(room), 100);
        }
    }

    public join() {
        this.client.joinPublicQueue();
    }

    public openP2PDialog(autoJoinRoom?: string) {
        this.client.gameManager.dialog.open(P2PDialogComponent, {
            width: '600px',
            disableClose: false,
            data: { autoJoinRoom }
        });
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
        // This method returning false hides the entire multiplayer card in the template if not connected.
        // We want to show the card if we are connected OR if we want to play P2P.
        // But the template uses showMultiplayer() to gate the whole block.
        // Let's change the template logic instead.
        return this.client.isConnected();
    }

    public isConnected() {
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

    public isServerless() {
        return environment.serverless;
    }
}
