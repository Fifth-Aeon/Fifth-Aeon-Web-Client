import { BattleshipGame, Direction, GameAction, GameActionType, GameEvent, GameEventType, Point, ShipType, TileBelief } from './battleship';
import { Messenger, MessageType, Message } from './messenger';
import { SoundManager } from './sound';

import { NgZone, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MdSnackBar } from '@angular/material';

import { getHttpUrl } from './url';

export enum ClientState {
    UnAuth, InLobby, Waiting, PrivateLobby, InQueue, InGame, Any
}

@Injectable()
export class WebClient {
    private username: string;
    private opponentUsername: string;
    private messenger: Messenger;
    private gameId: string = null;
    private state: ClientState = ClientState.UnAuth;
    private game: BattleshipGame = null;
    private playerNumber: number;
    private opponentNumber: number
    private finished: boolean = false;
    private unsunkShips: [Set<ShipType>, Set<ShipType>];
    private soundManager: SoundManager = new SoundManager();
    private connected: boolean = false;

    constructor(private snackbar: MdSnackBar, private router: Router, private zone: NgZone, private sanitizer: DomSanitizer) {
        this.game = new BattleshipGame(() => null);
        this.playerNumber = 0;
        this.messenger = new Messenger();
        this.messenger.addHandeler(MessageType.StartGame, this.startGame, this);
        this.messenger.addHandeler(MessageType.GameEvent, (msg) => this.handleGameEvent(msg.data), this);
        this.messenger.addHandeler(MessageType.ClientError, (msg) => console.error('Error:', msg.data), this);
        this.messenger.onlogin = (username) => {
            this.changeState(ClientState.InLobby);
            this.username = username;
            if (this.toJoin) {
                this.messenger.sendMessageToServer(MessageType.JoinPrivateGame, { gameId: this.toJoin });
            }
        }
        this.messenger.addHandeler(MessageType.QueueJoined, (msg) => this.changeState(ClientState.InQueue), this)
        this.messenger.addHandeler(MessageType.PrivateGameReady, (msg) => this.privateGameReady(msg), this)
        this.messenger.connectChange = (status) => zone.run(() => this.connected = status);
    }

    private privateGameUrl: string;

    private getInviteMessage() {
        return `You are invited to play battleship. Go to the url ${this.privateGameUrl} to play.`;
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
        this.privateGameUrl = getHttpUrl() + '/lobby/' + msg.data.gameId;
        this.changeState(ClientState.PrivateLobby);
    }

    private toJoin: string;
    public joinPrivateGame(gameId: string) {
        if (!this.username) {
            this.toJoin = gameId;
            return;
        }
        this.messenger.sendMessageToServer(MessageType.JoinPrivateGame, { gameId: gameId });
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public exitGame() {
        this.sendGameAction(GameActionType.Quit, {});
        this.game = new BattleshipGame(() => null);
        this.playerNumber = 0;
        this.changeState(ClientState.InLobby);
        this.router.navigate(['/lobby']);
    }

    public join() {
        this.messenger.sendMessageToServer(MessageType.JoinQueue, {});
        this.changeState(ClientState.Waiting);
    }


    public private() {
        this.messenger.sendMessageToServer(MessageType.NewPrivateGame, {});
        this.changeState(ClientState.Waiting);
    }

    public isInGame() {
        return this.state == ClientState.InGame;
    }

    public canFire() {
        return this.state == ClientState.InGame &&
            this.game.hasStarted() &&
            this.game.getTurn() == this.playerNumber &&
            this.game.getWinner() == -1;
    }

    public canPlaceShip(ship: ShipType, point: Point, dir: Direction): boolean {
        return this.game.canPlaceShip(this.playerNumber, ship, point, dir);
    }

    public canPlace(): boolean {
        return this.state == ClientState.InGame && !this.game.hasStarted();
    }

    private sendGameAction(type: GameActionType, params: any) {
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

    private handleGameEvent(event: GameEvent) {
        switch (event.type) {
            case GameEventType.Fired:
                let sfx = event.params.hit ? 'explosion' : 'splash';
                this.soundManager.playSound(sfx)
                break;
            case GameEventType.SunkShip:
                let params = event.params;
                let shipName = ShipType[params.ship].toLocaleLowerCase();
                let message = event.owner === this.playerNumber ?
                    `You sunk your oppponent\s ${shipName}.` :
                    `Your ${shipName} was sunk.`;
                this.snackbar.open(message, '', { duration: 3000 });
                break;

        }

        this.zone.run(() => this.game.syncServerEvent(this.playerNumber, event));
    }

    private changeState(newState: ClientState) {
        this.zone.run(() => this.state = newState);
    }

    public getInstuciton() {
        if (this.state == ClientState.UnAuth)
            return 'Attempting to login to server';
        if (this.state == ClientState.InLobby)
            return 'Logged in as ' + this.username + '.';
        if (this.state == ClientState.Waiting)
            return 'Waiting for server responce.';
        if (this.state == ClientState.PrivateLobby)
            return 'Private game ready, please invite a friend.';
        if (this.state == ClientState.InQueue)
            return 'In Queue. Waiting for an opponent.'
        if (this.game.getWinner() !== -1)
            return 'The game is over ' + this.namePlayer(this.game.getWinner()) + ' won.';
        if (!this.finished)
            return 'Place your peices.';
        if (!this.game.hasStarted())
            return 'Waiting for your opponent.'
        if (this.game.getTurn() == this.playerNumber)
            return 'It is your turn. Click a tile to fire.'
        return 'It is your opponents turn. Please wait.'
    }

    public place(row: number, col: number, ship: ShipType, dir: Direction) {
        let loc = new Point(row, col);
        if (this.game.placeShip(this.playerNumber, ship, loc, dir)) {
            this.sendGameAction(GameActionType.PlaceShip, {
                ship: ship,
                loc: loc,
                dir: dir
            });
            return true;
        }
    }

    public finish() {
        this.finished = true;
        this.sendGameAction(GameActionType.FinishPlacement, {});
    }

    public fire(row: number, col: number) {
        this.soundManager.playSound('shot');
        this.sendGameAction(GameActionType.Fire, {
            target: new Point(row, col)
        });
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
        this.game = new BattleshipGame(((p, error) => console.error(error)));
        this.router.navigate(['/game']);

        this.zone.run(() => {
            this.opponentUsername = msg.data.opponent;
            this.state = ClientState.InGame;
        });
    }

}
