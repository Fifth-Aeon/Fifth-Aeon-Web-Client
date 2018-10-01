
import { Injectable, NgZone } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { CollectionService } from 'app/collection.service';
import { EndDialogComponent } from './end-dialog/end-dialog.component';
import { GameManager } from './gameManager';
import { DeckList } from './game_model/deckList';
import { Message, MessageType, Messenger } from './messenger';
import { MessengerService } from './messenger.service';
import { Preloader } from './preloader';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { SoundManager } from './sound';
import { TipService, TipType } from './tips';
import { AuthenticationService, UserData } from './user/authentication.service';

export enum ClientState {
    UnAuth, InLobby, Waiting, PrivateLobby, PrivateLobbyFail, InQueue, InGame, Any
}

export enum GameType {
    AiGame, DoubleAiGame, PublicGame
}

@Injectable()
export class WebClient {
    private username: string;

    private messenger: Messenger;
    private state: ClientState = ClientState.UnAuth;
    private connected = false;

    public onDeckSelected: () => void;
    public getGameReward: (won: boolean) => Promise<string> = null;
    private onError: (error: string) => void = () => null;

    constructor(
        private soundManager: SoundManager,
        private tips: TipService,
        private router: Router,
        private zone: NgZone,
        public dialog: MatDialog,
        private hotkeys: HotkeysService,
        private collection: CollectionService,
        private gameManager: GameManager,
        preloader: Preloader,
        messengerService: MessengerService,
        auth: AuthenticationService
    ) {
        auth.onAuth((user) => {
            if (user) this.onLogin(user);
        });

        this.messenger = messengerService.getMessenger();
        this.messenger.addHandler(MessageType.StartGame, this.startGame, this);
        this.messenger.addHandler(MessageType.ClientError, (msg) => this.clientError(msg), this);
        this.messenger.addHandler(MessageType.QueueJoined, (msg) => this.changeState(ClientState.InQueue), this);
        this.messenger.connectChange = (status) => zone.run(() => this.connected = status);

        this.gameManager.onGameEnd = (won, quit) => this.openEndDialog(won, quit);

        this.addHotkeys();
    }

    private startGame(msg: Message) {
        this.gameManager.startGame(msg.data.opponent, msg.data.opponent);
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

    private addHotkeys() {
        this.hotkeys.add(new Hotkey('esc', (event: KeyboardEvent): boolean => {
            this.openSettings();
            return false;
        }, [], 'Settings'));

        this.hotkeys.add(new Hotkey('m', (event: KeyboardEvent): boolean => {
            this.soundManager.toggleMute();
            return false;
        }, [], 'Mute/Unmute'));

        this.hotkeys.add(new Hotkey('shift+t', (event: KeyboardEvent): boolean => {
            this.tips.toggleDisable();
            return false;
        }, [], 'Disable/Enable Tips'));
    }

    // Misc --------------------
    private onLogin(loginData: UserData) {
        this.changeState(ClientState.InLobby);
        this.username = loginData.username;
        this.tips.setUsername(this.username);
        this.gameManager.setUsername(this.username);
        this.tips.playTip(TipType.StartGame);
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
        let config = new MatDialogConfig();
        config.disableClose = true;
        let dialogRef = this.dialog.open(EndDialogComponent, config);

        dialogRef.componentInstance.winner = playerWon;
        dialogRef.componentInstance.quit = quit;

        let rewardMessage = this.getGameReward ? this.getGameReward(playerWon) : this.collection.onGameEnd(playerWon, quit);
        rewardMessage.then(msg => dialogRef.componentInstance.rewards = msg);
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
        this.zone.run(() => this.state = newState);
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
        }
        this.router.navigate(['/select']);
    }

}
