import { Game, GameAction, SyncGameEvent, GameActionType, GameEventType, GamePhase } from './game_model/game';
import { data } from './game_model/gameData';
import { GameFormat, standardFormat } from './game_model/gameFormat';
import { Card } from './game_model/card';
import { Unit } from './game_model/unit';
import { DeckList } from './game_model/deckList';

import { Messenger, MessageType, Message } from './messenger';
import { SoundManager } from './sound';
import { Preloader } from './preloader';
import { getHttpUrl } from './url';
import { AI, BasicAI } from './ai';

import { EndDialogComponent } from './end-dialog/end-dialog.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { OverlayService } from './overlay.service';
import { TipService, TipType } from './tips';

import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { every } from 'lodash'
import { NgZone, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MdSnackBar } from '@angular/material';
import { Deserialize } from 'cerialize'
import { HotkeysService, Hotkey } from 'angular2-hotkeys';



export enum ClientState {
    UnAuth, InLobby, Waiting, PrivateLobby, PrivateLobbyFail, InQueue, InGame, Any
}

@Injectable()
export class WebClient {
    private username: string;
    private opponentUsername: string;
    private deck: DeckList = new DeckList(standardFormat);

    private messenger: Messenger;
    private gameId: string = null;
    private state: ClientState = ClientState.UnAuth;
    private game: Game = null;
    private playerNumber: number;
    private opponentNumber: number
    private finished: boolean = false;
    private connected: boolean = false;
    private privateGameUrl: string;
    private privateGameId: string = null;

    private onError: (error: string) => void = () => null;

    constructor(private soundManager: SoundManager, private tips: TipService,
        private router: Router, private zone: NgZone, private sanitizer: DomSanitizer,
        preloader: Preloader, public dialog: MdDialog, private overlay: OverlayService,
        private hotkeys: HotkeysService) {

        this.game = new Game(standardFormat, true);
        this.playerNumber = 0;
        this.messenger = new Messenger();

        this.messenger.onlogin = (username) => this.onLogin(username);
        this.messenger.addHandeler(MessageType.StartGame, this.startGame, this);
        this.messenger.addHandeler(MessageType.GameEvent, (msg) => this.handleGameEvent(msg.data), this);
        this.messenger.addHandeler(MessageType.ClientError, (msg) => this.clientError(msg), this);
        this.messenger.addHandeler(MessageType.QueueJoined, (msg) => this.changeState(ClientState.InQueue), this)
        this.messenger.addHandeler(MessageType.PrivateGameReady, (msg) => this.privateGameReady(msg), this)
        this.messenger.connectChange = (status) => zone.run(() => this.connected = status);

        this.tips.playTip(TipType.StartGame);
        this.addHotkeys();

    }

    private addHotkeys() {
        this.hotkeys.add(new Hotkey('esc', (event: KeyboardEvent): boolean => {
            this.openSettings();
            return false; // Prevent bubbling
        }, [], 'Settings'));

        this.hotkeys.add(new Hotkey('m', (event: KeyboardEvent): boolean => {
            this.soundManager.toggleMute();
            return false; // Prevent bubbling
        }, [], 'Mute/Unmute'));

        
    }

    // Game Actions -------------------------
    public playCard(card: Card, targets: Unit[] = []) {
        let targetIds = targets.map(target => target.getId());
        card.getTargeter().setTarget(targets);
        this.game.playCard(this.game.getPlayer(this.playerNumber), card);
        this.sendGameAction(GameActionType.playCard, { id: card.getId(), targetIds: targetIds })
        this.tips.playCardTrigger(card, this.game);
    }

    public makeChoice(cards: Card[]) {
        this.sendGameAction(GameActionType.CardChoice, {
            choice: cards.map(card => card.getId())
        });
    }

    public pass() {
        this.sendGameAction(GameActionType.pass, {});
    }

    public playResource(type: string) {
        this.sendGameAction(GameActionType.playResource, { type: type });
    }

    public toggleAttacker(unit: Unit) {
        unit.toggleAttacking();
        this.sendGameAction(GameActionType.toggleAttack, { unitId: unit.getId() });
    }

    public declareBlocker(blocker: Unit, blocked: Unit | null) {
        let blockedId = blocked ? blocked.getId() : null;
        this.addBlockOverlay(blocker.getId(), blockedId);
        blocker.setBlocking(blockedId);
        this.sendGameAction(GameActionType.declareBlockers, {
            blockerId: blocker.getId(),
            blockedId: blockedId
        });
    }

    // Misc --------------------
    private onLogin(loginData: { username: string, token: string, deckList: string }) {
        this.changeState(ClientState.InLobby);
        this.username = loginData.username;
        this.deck = new DeckList(standardFormat);
        this.deck.fromJson(loginData.deckList);

        if (this.toJoin) {
            this.joinPrivateGame(this.toJoin);
        }
    }

    public isLoggedIn() {
        return !(this.state == ClientState.UnAuth);
    }

    public addBlockOverlay(blocker: string, blocked: string) {
        if (blocked == null) {
            this.overlay.removeBlocker(blocker);
            return;
        }
        if (this.game.getUnitById(blocker).getBlockedUnitId() != null)
            this.overlay.removeBlocker(blocker);
        this.overlay.addBlocker(blocker, blocked);
    }

    public attackWithAll() {
        if (this.playerNumber != this.game.getCurrentPlayer().getPlayerNumber())
            return;
        let potential = this.game.getCurrentPlayerUnits().filter(unit => unit.canAttack());
        if (every(potential, unit => unit.isAttacking())) {
            potential.forEach(unit => this.toggleAttacker(unit))
        } else {
            potential.forEach(unit => {
                if (!unit.isAttacking()) this.toggleAttacker(unit)
            })
        }
    }

    private clientError(msg: Message) {
        console.error(msg.data);
        this.onError(msg.data);
    }

    public setDeck(deck: DeckList) {
        this.messenger.sendMessageToServer(MessageType.SetDeck, {
            deckList: deck.toJson()
        });
    }

    public returnToLobby() {
        switch (this.state) {
            case ClientState.InGame:
                this.exitGame();
                break;
            case ClientState.InQueue:
                this.leaveQueue();
                break;
            case ClientState.PrivateLobby:
                if (this.privateGameId) {
                    this.messenger.sendMessageToServer(MessageType.CancelPrivateGame, { gameId: this.privateGameId });
                    this.privateGameId = null;
                }
                break;
        }
        this.router.navigate(['/lobby']);
        this.changeState(ClientState.InLobby);
    }

    private getInviteMessage() {
        return `You are invited to play ccg. Go to the url ${this.privateGameUrl} to play.`;
    }

    public getDeck() {
        return this.deck;
    }

    public getPrivateGameUrl() {
        return this.privateGameUrl;
    }

    public getPrivateGameEmailUrl() {
        return this.sanitizer.bypassSecurityTrustUrl('mailto:?subject=Battleship Invite&body=' + encodeURIComponent(this.getInviteMessage()));
    }

    public getPrivateGameSMSUrl() {
        return this.sanitizer.bypassSecurityTrustUrl('sms:?body=' + encodeURIComponent(this.getInviteMessage()));
    }

    private privateGameReady(msg: Message) {
        this.privateGameUrl = getHttpUrl() + '/private/' + msg.data.gameId;
        this.privateGameId = msg.data.gameId;
        this.changeState(ClientState.PrivateLobby);
        this.router.navigate(['/private']);
    }

    private toJoin: string;
    public joinPrivateGame(gameId: string) {
        this.changeState(ClientState.PrivateLobby);
        if (!this.username) {
            this.toJoin = gameId;
            return;
        }
        this.messenger.sendMessageToServer(MessageType.JoinPrivateGame, { gameId: gameId });
        this.onError = (err: string) => {
            if (err.includes('No game with that id.')) {
                this.changeState(ClientState.PrivateLobbyFail);
            }
        }
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public exitGame() {
        this.sendGameAction(GameActionType.Quit, {});
        this.game = new Game(standardFormat, true);
        this.playerNumber = 0;
        this.changeState(ClientState.InLobby);
        this.router.navigate(['/lobby']);
    }

    public join() {
        this.router.navigate(['/queue']);
        this.messenger.sendMessageToServer(MessageType.JoinQueue, {});
        this.changeState(ClientState.Waiting);
    }

    public deckEditor() {
        this.router.navigate(['/deck']);
    }

    public leaveQueue() {
        this.messenger.sendMessageToServer(MessageType.ExitQueue, {});
    }

    public private() {
        this.messenger.sendMessageToServer(MessageType.NewPrivateGame, {});
        this.changeState(ClientState.Waiting);
    }

    public isInGame() {
        return this.state == ClientState.InGame;
    }

    private sendEventsToAi(events: SyncGameEvent[]) {
        for (let event of events) {
            this.handleGameEvent(event);
            this.ai.handleGameEvent(event);
        }
    }

    private sendGameAction(type: GameActionType, params: any, isAi: boolean = false) {
        if (this.ai) {
            this.sendEventsToAi(this.gameModel.handleAction({
                type: type,
                player: isAi ? 1 : 0,
                params: params
            }));
            return;
        }
        this.messenger.sendMessageToServer(MessageType.GameAction, {
            type: type,
            params: params
        } as GameAction);
    }

    private namePlayer(player: number, cap: boolean = false) {
        if (player == this.playerNumber)
            return 'you';
        return 'your opponent'
    }

    private handleGameEvent(event: SyncGameEvent) {
        //console.log('event', GameEventType[event.type]);
        this.zone.run(() => this.game.syncServerEvent(this.playerNumber, event));
        switch (event.type) {
            case GameEventType.turnStart:
                if (event.params.turn != this.playerNumber)
                    return;
                this.tips.turnStartTrigger(this.game, this.playerNumber);
                break;
            case GameEventType.attackToggled:
                this.soundManager.playSound('attack');
                break;
            case GameEventType.block:
                this.addBlockOverlay(event.params.blockerId, event.params.blockedId)
                this.soundManager.playSound('attack');
                break;
            case GameEventType.phaseChange:
                if (event.params.phase === GamePhase.combat)
                    this.tips.blockPhaseTrigger(this.game, this.playerNumber);
                if (event.params.phase === GamePhase.play2)
                    this.overlay.clearBlockers();
                break;
            case GameEventType.playCard:
                this.soundManager.playSound('magic');
                break;
            case GameEventType.Ended:
                this.openEndDialog(event.params.winner, event.params.quit);
                break
            case GameEventType.playResource:
                this.tips.playResourceTrigger(this.game, this.playerNumber);
                break;
        }
    }

    private openEndDialog(winner: number, quit: boolean) {
        let playerWon = this.playerNumber === winner;
        let config = new MdDialogConfig();
        config.disableClose = true;
        let dialogRef = this.dialog.open(EndDialogComponent, config);
        dialogRef.componentInstance.winner = playerWon;
        dialogRef.componentInstance.quit = quit;
        dialogRef.afterClosed().subscribe(result => {
            this.returnToLobby();
        });
    }

    public openSettings() {
        let dialogRef = this.dialog.open(SettingsDialogComponent);
        /*
        dialogRef.afterClosed().subscribe(result => {
            this.returnToLobby();
        });
        */
    }

    private changeState(newState: ClientState) {
        this.zone.run(() => this.state = newState);
    }

    public getInstruction() {
        if (this.state == ClientState.UnAuth)
            return 'Attempting to login to server';
        if (this.state == ClientState.InLobby)
            return 'Logged in as ' + this.username + '.';
        if (this.state == ClientState.Waiting)
            return 'Waiting for server responce.';
        if (this.state == ClientState.PrivateLobby)
            return 'Private game ready, please invite a friend.';
        if (this.state == ClientState.PrivateLobbyFail)
            return 'Failed to join game (it may have been canceled).';
        if (this.state == ClientState.InQueue)
            return 'In Queue. Waiting for an opponent.'
        return 'Error.'
    }

    public getState() {
        return this.state;
    }

    public getGame() {
        return this.game;
    }

    public getPlayerdata() {
        return {
            me: this.playerNumber,
            op: this.opponentNumber
        }
    }

    public getUsername() {
        return this.username;
    }

    public getOpponentUsername() {
        return this.opponentUsername;
    }

    private startGame(msg: Message) {
        this.gameId = msg.data.gameId;
        this.playerNumber = msg.data.playerNumber;
        this.opponentNumber = 1 - this.playerNumber;
        this.game = new Game(standardFormat, true);
        this.router.navigate(['/game']);
        this.soundManager.playSound('gong');
        this.zone.run(() => {
            this.opponentUsername = msg.data.opponent;
            this.state = ClientState.InGame;
        });
    }


    // AI stuff ------------------------------------
    private gameModel: Game;
    private ai: AI;
    public startAIGame() {
        this.playerNumber = 0;
        this.opponentNumber = 1;
        this.game = new Game(standardFormat, true);
        this.gameModel = new Game(standardFormat, false, [this.deck, new DeckList(standardFormat)]);
        let aiModel = new Game(standardFormat, true);

        let aiAction = (type: GameActionType, params: any) => {
            //console.log('ai action', GameActionType[type], params);
            this.sendGameAction(type, params, true)
        };
        let delay = (cb: () => void) => this.soundManager.doWhenDonePlaying(cb);
        this.ai = new BasicAI(1, aiModel, aiAction);

        this.router.navigate(['/game']);
        this.zone.run(() => {
            this.opponentUsername = 'A.I';
            this.state = ClientState.InGame;
            this.sendEventsToAi(this.gameModel.startGame());
        });
    }
}
