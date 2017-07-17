import { Game, GameAction, SyncGameEvent, GameActionType, GameEventType } from './game_model/game';
import { data } from './game_model/gameData';
import { GameFormat } from './game_model/gameFormat';
import { Messenger, MessageType, Message } from './messenger';
import { SoundManager } from './sound';
import { preload } from './preloader';
import { getHttpUrl } from './url';

import { NgZone, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MdSnackBar } from '@angular/material';
import { Deserialize } from 'cerialize'

import { Card } from './game_model/card';
import { Unit } from './game_model/unit';

export enum ClientState {
    UnAuth, InLobby, Waiting, PrivateLobby, PrivateLobbyFail, InQueue, InGame, Any
}

@Injectable()
export class WebClient {
    private username: string;
    private opponentUsername: string;

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

    constructor(private soundManager: SoundManager, private snackbar: MdSnackBar, private router: Router, private zone: NgZone, private sanitizer: DomSanitizer) {
        this.game = new Game(new GameFormat(), true);
        this.playerNumber = 0;
        this.messenger = new Messenger();

        this.messenger.onlogin = (username) => this.onLogin(username);
        this.messenger.addHandeler(MessageType.StartGame, this.startGame, this);
        this.messenger.addHandeler(MessageType.GameEvent, (msg) => this.handleGameEvent(msg.data), this);
        this.messenger.addHandeler(MessageType.ClientError, (msg) => this.clientError(msg), this);
        this.messenger.addHandeler(MessageType.QueueJoined, (msg) => this.changeState(ClientState.InQueue), this)
        this.messenger.addHandeler(MessageType.PrivateGameReady, (msg) => this.privateGameReady(msg), this)
        this.messenger.connectChange = (status) => zone.run(() => this.connected = status);

        preload();
    }


    // Game Actions -------------------------
    public playCard(card: Card, target?: Unit) {
        let targetId = target ? target.getId() : null;
        if (target)
            card.getTargeter().setTarget(target);
        this.game.playCard(this.game.getPlayer(this.playerNumber), card);
        this.sendGameAction(GameActionType.playCard, { id: card.getId(), target: { id: targetId } })
    }

    public pass() {
        this.sendGameAction(GameActionType.pass, {});
    }

    public playResource(type: string) {
        this.sendGameAction(GameActionType.playResource, { type: type });
    }

    public toggleAttacker(unitId: string) {
        this.sendGameAction(GameActionType.toggleAttack, { unitId: unitId });
    }

    public declareBlocker(blocker: Unit, blocked: Unit) {
        blocker.setBlocking(blocked.getId());
        this.sendGameAction(GameActionType.declareBlockers, {
            blockerId: blocker.getId(),
            blockedId: blocked.getId()
        });
    }

    // Misc --------------------
    private onLogin(username: string) {
        this.changeState(ClientState.InLobby);
        this.username = username;
        if (this.toJoin) {
            this.joinPrivateGame(this.toJoin);
        }
    }

    private clientError(msg: Message) {
        console.error(msg.data);
        this.onError(msg.data);
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
        this.game = new Game(new GameFormat(), true);
        this.playerNumber = 0;
        this.changeState(ClientState.InLobby);
        this.router.navigate(['/lobby']);
    }

    public join() {
        this.router.navigate(['/queue']);
        this.messenger.sendMessageToServer(MessageType.JoinQueue, {});
        this.changeState(ClientState.Waiting);
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

    private sendGameAction(type: GameActionType, params: any, isAi: boolean = false) {
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
        console.log('event', event);
        this.zone.run(() => this.game.syncServerEvent(this.playerNumber, event));
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
        this.game = new Game(new GameFormat(), true);
        this.router.navigate(['/game']);

        this.zone.run(() => {
            this.opponentUsername = msg.data.opponent;
            this.state = ClientState.InGame;
        });
    }


}
