import { Injectable, NgZone } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { CollectionService } from 'app/collection.service';
import { EndDialogComponent } from './end-dialog/end-dialog.component';
import { GameManager } from './gameManager';
import { DeckList } from './game_model/deckList';
import { Message, MessageType, Messenger } from './messenger';
import { MessengerService } from './messenger.service';
import { Preloader } from './preloader';
import { SoundManager } from './sound';
import { TipService, TipType } from './tips';
import { AuthenticationService, UserData } from './user/authentication.service';
import { SettingsDialogComponent } from './settings/settings-dialog/settings-dialog.component';
import { GameType } from './gameType';
import { P2PClient } from './p2p/p2p-client';
import { ISignalingService } from './p2p/signaling/signaling-service';
import { environment } from '../environments/environment';

export enum ClientState {
    UnAuth,
    InLobby,
    Waiting,
    PrivateLobby,
    PrivateLobbyFail,
    InQueue,
    InGame,
    Any
}


@Injectable()
export class WebClient {
    private username = '';
    private messenger: Messenger;
    private state: ClientState = ClientState.UnAuth;
    private connected = false;
    private connectedToLocalServer = false;

    public getGameReward: ((won: boolean) => Promise<string>) | null = null;
    public onDeckSelected: () => void = () => null;
    private onError: (error: string) => void = () => null;

    constructor(
        private soundManager: SoundManager,
        private tips: TipService,
        private router: Router,
        private zone: NgZone,
        public dialog: MatDialog,
        private hotkeys: HotkeysService,
        private collection: CollectionService,
        public gameManager: GameManager,
        preloader: Preloader,
        messengerService: MessengerService,
        auth: AuthenticationService
    ) {
        auth.onAuth(user => {
            if (user) {
                this.onLogin(user);
            }
        });

        this.messenger = messengerService.getMessenger();
        this.messenger.addHandler(MessageType.StartGame, this.startGame, this);
        this.messenger.addHandler(
            MessageType.ClientError,
            msg => this.clientError(msg),
            this
        );
        this.messenger.addHandler(
            MessageType.QueueJoined,
            msg => this.changeState(ClientState.InQueue),
            this
        );

        this.messenger.connectChange = status =>
            zone.run(() => (this.connected = status));
        messengerService.getLocalMessenger().connectChange = status =>
            zone.run(() => (this.connectedToLocalServer = status));

        this.gameManager.setGameEndCallback((won, quit) =>
            this.openEndDialog(won, quit)
        );

        this.addHotkeys();
    }

    private startGame(msg: Message) {
        this.gameManager.startMultiplayerGame(
            msg.data.playerNumber,
            msg.data.opponent
        );
        this.changeState(ClientState.InGame);
        this.router.navigate(['/game']);
    }

    public startAIGame() {
        this.gameManager.startAIGame();
        this.changeState(ClientState.InGame);
        this.router.navigate(['/game']);
    }

    public startDoubleAIGame() {
        this.gameManager.startAIGame(2);
        this.getGameReward = () => Promise.resolve('No reward in A.I mode');
        this.changeState(ClientState.InGame);
        this.router.navigate(['/game']);
    }

    public async startLocalAIGame() {
        this.router.navigate(['/queue']);

        await this.gameManager.startAiServerGame();
        this.getGameReward = () => Promise.resolve('No reward in A.I mode');
        this.changeState(ClientState.InGame);
        this.router.navigate(['/game']);
    }

    private addHotkeys() {
        this.hotkeys.add(
            new Hotkey(
                'esc',
                (event: KeyboardEvent): boolean => {
                    this.openSettings();
                    return false;
                },
                [],
                'Settings'
            )
        );

        this.hotkeys.add(
            new Hotkey(
                'm',
                (event: KeyboardEvent): boolean => {
                    this.soundManager.toggleMute();
                    return false;
                },
                [],
                'Mute/Unmute'
            )
        );

        this.hotkeys.add(
            new Hotkey(
                'shift+t',
                (event: KeyboardEvent): boolean => {
                    this.tips.toggleDisable();
                    return false;
                },
                [],
                'Disable/Enable Tips'
            )
        );
    }

    // Misc --------------------
    private onLogin(loginData: UserData) {
        this.changeState(ClientState.InLobby);
        this.username = loginData.username;
        this.tips.setUsername(this.username);
        this.gameManager.setUsername(this.username);
        this.tips.playTip(TipType.StartGame);
    }

    public enterOfflineMode(): boolean {
        this.changeState(ClientState.InLobby);
        this.username = environment.serverless ? 'Player' : 'Offline Player';
        this.tips.setUsername(this.username);
        this.gameManager.setUsername(this.username);

        const hasSound = localStorage.getItem('sound-settings');
        const hasTips = localStorage.getItem('tip-store');
        return !hasSound && !hasTips;
    }

    public startP2PGame(signaling: ISignalingService, isHost: boolean) {
        const p2p = new P2PClient(signaling);
        p2p.initiate(isHost);
        this.messenger.setP2PTransport(p2p);
        this.gameManager.startP2PBackendGame(isHost);

        this.messenger.connectChange = (connected) => {
            if (connected) {
                this.zone.run(() => {
                    this.dialog.closeAll();
                    this.selectDeckAndStartGame(isHost ? GameType.P2PHost : GameType.P2PJoin);
                });
            }
        };

        this.gameManager.onP2PGameStarted = () => {
            this.changeState(ClientState.InGame);
            this.router.navigate(['/game']);
        };
    }

    public isLoggedIn() {
        return !(this.state === ClientState.UnAuth);
    }

    private clientError(msg: Message) {
        console.error(msg.data.message || msg.data);
        this.onError(msg.data);
    }

    // Decks -----------------------------------------------------
    public setDeck(deck: DeckList) {
        if (!deck) {
            console.error('setting undef deck', deck);
            return;
        }
        this.gameManager.setDeck(deck);
        this.messenger.sendMessageToServer(MessageType.SetDeck, {
            deckList: deck.toJson()
        });

        if (this.onDeckSelected) {
            // Only call onDeckSelected if we haven't already started the game 
            // (e.g. P2P game might start immediately if opponent is ready)
            if (this.state !== ClientState.InGame) {
                this.onDeckSelected();
            }
        }
    }

    // Transitions -----------------------------------------------
    public returnToLobby() {
        switch (this.state) {
            case ClientState.InGame:
                this.exitGame();
                break;
            case ClientState.InQueue:
                this.leaveQueue();
                break;
        }
        this.router.navigate(['/lobby']);
        this.changeState(ClientState.InLobby);
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public isConnectedToLocalServer(): boolean {
        return this.connectedToLocalServer;
    }

    public exitGame(final = false) {
        this.gameManager.exitGame();
        if (final) {
            this.messenger.close();
        } else {
            this.changeState(ClientState.InLobby);
            this.router.navigate(['/lobby']);
        }
    }

    public joinPublicQueue() {
        this.router.navigate(['/queue']);
        this.messenger.sendMessageToServer(MessageType.JoinQueue, {});
        this.changeState(ClientState.Waiting);
    }

    public startP2PDeckSelected() {
        this.router.navigate(['/queue']);
        this.changeState(ClientState.Waiting);
    }

    public openDeckSelector() {
        this.router.navigate(['/select']);
    }

    public openDeckEditor() {
        this.tips.playTip(TipType.EditDeck);
        this.router.navigate(['/deck']);
    }

    public leaveQueue() {
        this.messenger.sendMessageToServer(MessageType.ExitQueue, {});
    }

    public isInGame() {
        return this.state === ClientState.InGame;
    }

    private openEndDialog(playerWon: boolean, quit: boolean) {
        const config = new MatDialogConfig();
        config.disableClose = true;
        const dialogRef = this.dialog.open(EndDialogComponent, config);

        dialogRef.componentInstance.winner = playerWon;
        dialogRef.componentInstance.quit = quit;

        const rewardMessage = this.getGameReward
            ? this.getGameReward(playerWon)
            : this.collection.onGameEnd(playerWon, quit);
        rewardMessage.then(msg => (dialogRef.componentInstance.rewards = msg));
        dialogRef.afterClosed().subscribe(result => {
            this.gameManager.reset();
            this.returnToLobby();
        });
    }

    public openSettings() {
        this.dialog.open(SettingsDialogComponent, {
            height: '350px'
        });
    }

    private changeState(newState: ClientState) {
        this.zone.run(() => (this.state = newState));
    }

    public getState() {
        return this.state;
    }

    public getUsername() {
        return this.username;
    }

    public selectDeckAndStartGame(type: GameType) {
        this.tips.playTip(TipType.SelectDeck);
        switch (type) {
            case GameType.AiGame:
                this.onDeckSelected = this.startAIGame;
                break;
            case GameType.DoubleAiGame:
                this.onDeckSelected = this.startDoubleAIGame;
                break;
            case GameType.PublicGame:
                this.onDeckSelected = this.joinPublicQueue;
                break;
            case GameType.ServerAIGame:
                this.onDeckSelected = this.startLocalAIGame;
                break;
            case GameType.P2PHost:
            case GameType.P2PJoin:
                this.onDeckSelected = this.startP2PDeckSelected;
                break;
        }
        this.router.navigate(['/select']);
    }
    public openP2PDialog(autoJoinRoom?: string) {
        // Store the pending join room in WebClient state.
        this.pendingP2PRoom = autoJoinRoom;
        this.router.navigate(['/lobby']);
    }

    public pendingP2PRoom: string | undefined;

}
