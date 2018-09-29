// Vendor
import { sample, every } from 'lodash';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { NgZone, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { Angulartics2 } from 'angulartics2';


// Game Model
import { GameAction, GameSyncEvent, GameActionType, SyncEventType, GamePhase } from './game_model/game';
import { ServerGame } from './game_model/serverGame';
import { ClientGame } from './game_model/clientGame';
import { standardFormat } from './game_model/gameFormat';
import { Card } from './game_model/card';
import { Unit } from './game_model/unit';
import { DeckList } from './game_model/deckList';
import { Log } from './game_model/log';
import { AI } from './game_model/ai/ai';
import { DefaultAI } from './game_model/ai/defaultAi';
import { allDecks } from './game_model/scenarios/decks';

// Client side
import { Messenger, MessageType, Message } from './messenger';
import { SoundManager } from './sound';
import { Preloader } from './preloader';

import { EndDialogComponent } from './end-dialog/end-dialog.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { OverlayService } from './game/overlay.service';
import { TipService, TipType } from './tips';
import { SpeedService } from 'app/speed.service';
import { CollectionService } from 'app/collection.service';
import { DamageDistributionDialogComponent } from './game/damage-distribution-dialog/damage-distribution-dialog.component';
import { MessengerService } from './messenger.service';
import { UserData, AuthenticationService } from './user/authentication.service';
import { Scenario } from './game_model/scenario';
import { tutorialCampaign } from './game_model/scenarios/tutorial';


export enum ClientState {
    UnAuth, InLobby, Waiting, PrivateLobby, PrivateLobbyFail, InQueue, InGame, Any
}

export enum GameType {
    AiGame, PublicGame, PrivateGame
}


@Injectable()
export class WebClient {
    private username: string;
    private opponentUsername: string;
    private deck: DeckList = new DeckList(standardFormat);

    private messenger: Messenger;
    private state: ClientState = ClientState.UnAuth;
    private playerNumber: number;
    private opponentNumber: number;
    private connected = false;
    private privateGameUrl: string;
    private privateGameId: string = null;
    public log: Log;

    private game: ClientGame;
    private gameModel: ServerGame;
    private ai: AI;
    private aiTick: any;

    private toJoin: string;
    public onDeckSelected: () => void;
    public onGameEnd: (won: boolean) => Promise<string> = null;

    private onError: (error: string) => void = () => null;

    constructor(
        private soundManager: SoundManager,
        private tips: TipService,
        private router: Router,
        private zone: NgZone,
        private sanitizer: DomSanitizer,
        public dialog: MatDialog,
        private overlay: OverlayService,
        private hotkeys: HotkeysService,
        private analytics: Angulartics2,
        private speed: SpeedService,
        private collection: CollectionService,
        preloader: Preloader,
        messengerService: MessengerService,
        auth: AuthenticationService
    ) {
        auth.onAuth((user) => {
            if (user) this.onLogin(user);
        });
        this.initGame();
        this.playerNumber = 0;
        this.messenger = messengerService.getMessenger();
        this.log = new Log(this.playerNumber);

        this.messenger.addHandler(MessageType.StartGame, this.startGame, this);
        this.messenger.addHandler(MessageType.GameEvent, (msg) => this.handleGameEvent(msg.data), this);
        this.messenger.addHandler(MessageType.ClientError, (msg) => this.clientError(msg), this);
        this.messenger.addHandler(MessageType.QueueJoined, (msg) => this.changeState(ClientState.InQueue), this);
        this.messenger.connectChange = (status) => zone.run(() => this.connected = status);

        this.addHotkeys();

        this.setAISpeed(1000);
    }

    public setAISpeed(ms: number) {
        if (this.aiTick !== undefined)
            clearInterval(this.aiTick);
        this.aiTick = setInterval(() => {
            if (this.ai)
                this.ai.pulse();
        }, ms);
    }

    private initGame() {
        this.game = new ClientGame('player',
            (type, params) => this.sendGameAction(type, params, false),
            this.overlay.getAnimator(),
            this.log);
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

    // Game Actions -------------------------------------------------------------------------
    public playCard(card: Card, targets: Unit[] = []) {
        this.game.playCardExtern(card, targets);
        this.tips.playCardTrigger(card, this.game);
    }

    public makeChoice(cards: Card[]) {
        this.game.makeChoice(this.playerNumber, cards);
    }

    public pass() {
        this.game.pass();
    }

    public playResource(type: string) {
        this.game.playResource(type);
    }

    public toggleAttacker(unit: Unit) {
        this.game.declareAttacker(unit);
    }

    public declareBlocker(blocker: Unit, blocked: Unit | null) {
        this.game.declareBlocker(blocker, blocked);
    }

    // Misc --------------------
    private onLogin(loginData: UserData) {
        this.changeState(ClientState.InLobby);
        this.username = loginData.username;
        this.deck = new DeckList(standardFormat);
        this.tips.setUsername(this.username);
        this.tips.playTip(TipType.StartGame);
    }

    public isLoggedIn() {
        return !(this.state === ClientState.UnAuth);
    }

    public addBlockOverlay(blocker: string, blocked: string) {
        if (blocked === null) {
            this.overlay.removeBlocker(blocker);
            return;
        }
        if (this.game.getUnitById(blocker).getBlockedUnitId() !== null)
            this.overlay.removeBlocker(blocker);
        this.overlay.addBlocker(blocker, blocked);
    }

    public attackWithAll() {
        if (this.playerNumber !== this.game.getCurrentPlayer().getPlayerNumber())
            return;
        let potential = this.game.getCurrentPlayerUnits().filter(unit => unit.canAttack());
        let allAttacking = every(potential, unit => unit.isAttacking());
        potential.forEach(unit => {
            if (allAttacking || !unit.isAttacking())
                this.toggleAttacker(unit);
        });
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
        this.deck = deck;
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

    public getDeck() {
        return this.deck;
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public exitGame(final = false) {
        this.sendGameAction(GameActionType.Quit, {});

        if (final) {
            this.messenger.close();
        } else {
            this.initGame();
            this.playerNumber = 0;
            this.changeState(ClientState.InLobby);
            this.router.navigate(['/lobby']);
        }
    }

    public join() {
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

    public private() {
        this.messenger.sendMessageToServer(MessageType.NewPrivateGame, {});
        this.changeState(ClientState.Waiting);
    }

    public isInGame() {
        return this.state === ClientState.InGame;
    }

    private sendEventsToLocalPlayers(events: GameSyncEvent[]) {
        setTimeout(() => {
            for (let event of events) {
                this.handleGameEvent(event);
                this.ai.handleGameEvent(event);
            }
        }, 50);
    }

    private sendGameAction(type: GameActionType, params: any, isAi: boolean = false) {
        if (this.ai) {
            let res = this.gameModel.handleAction({
                type: type,
                player: isAi ? 1 : 0,
                params: params
            });
            if (res === null) {
                console.error('An action sent to game model by', isAi ?
                    'the A.I' : 'the player', 'failed.', 'It was', GameActionType[type], 'with', params);
                return;
            }
            this.sendEventsToLocalPlayers(res);
            return;
        }
        this.messenger.sendMessageToServer(MessageType.GameAction, {
            type: type,
            params: params
        } as GameAction);
    }

    private openDamageSelector(attacker: Unit, defenders: Unit[]) {
        let config = new MatDialogConfig();
        config.disableClose = true;
        let dialogRef = this.dialog.open(DamageDistributionDialogComponent, config);

        dialogRef.componentInstance.attacker = attacker;
        dialogRef.componentInstance.defenders = defenders;

        return dialogRef.afterClosed().toPromise()
            .then((order: Unit[]) => {
                this.game.setAttackOrder(attacker, order);
            });
    }

    private createDamageSelectors() {
        let orderables = Array.from(this.game.getModableDamageDistributions().entries())
            .map(entry => {
                return { attacker: this.game.getUnitById(entry[0]), blockers: entry[1] };
            });
        let runNext = () => {
            if (orderables.length === 0) {
                this.game.pass();
                return;
            }
            let next = orderables.pop();
            this.openDamageSelector(next.attacker, next.blockers)
                .then(runNext);
        };
        runNext();
    }

    private handleGameEvent(event: GameSyncEvent) {
        this.zone.run(() => this.game.syncServerEvent(this.playerNumber, event));
        this.tips.handleGameEvent(this.game, this.playerNumber, event);
        this.soundManager.handleGameEvent(event);
        switch (event.type) {
            case SyncEventType.TurnStart:
                if (event.params.turn !== this.playerNumber)
                    return;
                break;
            case SyncEventType.EnchantmentModified:
                let avatar = this.game.getCurrentPlayer().getPlayerNumber() === this.playerNumber ?
                    'player' : 'enemy';
                this.overlay.addInteractionArrow(avatar, event.params.enchantmentId);
                break;
            case SyncEventType.Block:
                this.addBlockOverlay(event.params.blockerId, event.params.blockedId);
                break;
            case SyncEventType.PhaseChange:
                if (event.params.phase === GamePhase.DamageDistribution && this.game.isActivePlayer(this.playerNumber))
                    this.createDamageSelectors();
                if (event.params.phase === GamePhase.Play2)
                    this.overlay.clearBlockers();

                break;
            case SyncEventType.PlayCard:
                this.overlay.onPlay(this.game.getCardById(event.params.played.id), this.game, this.playerNumber);
                break;
            case SyncEventType.Ended:
                this.endGame(event.params.winner, event.params.quit);
                break;
        }
    }

    private endGame(winner: number, quit: boolean) {
        const playerWon = winner === this.playerNumber;
        this.openEndDialog(playerWon, quit);
        this.analytics.eventTrack.next({
            action: 'endGame',
            properties: {
                category: 'usage',
                label: !this.ai ? 'singleplayer' : 'multiplayer'
            }
        });
        this.soundManager.playImportantSound(playerWon ? 'fanfare' : 'defeat');
    }

    private openEndDialog(playerWon: boolean, quit: boolean) {
        let config = new MatDialogConfig();
        config.disableClose = true;
        let dialogRef = this.dialog.open(EndDialogComponent, config);

        dialogRef.componentInstance.winner = playerWon;
        dialogRef.componentInstance.quit = quit;

        let messagePromise = this.onGameEnd ? this.onGameEnd(playerWon) : this.collection.onGameEnd(playerWon, quit);
        messagePromise.then(msg => dialogRef.componentInstance.rewards = msg);
        dialogRef.afterClosed().subscribe(result => {
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

    public getGame() {
        return this.game;
    }

    public getPlayerData() {
        return {
            me: this.playerNumber,
            op: this.opponentNumber
        };
    }

    public getUsername() {
        return this.username;
    }

    public getOpponentUsername() {
        return this.opponentUsername;
    }

    public selectDeckAndStartGame(type: GameType) {
        this.tips.playTip(TipType.SelectDeck);
        switch (type) {
            case GameType.AiGame:
                this.onDeckSelected = this.startAIGame;
                break;
            case GameType.PrivateGame:
                this.onDeckSelected = this.private;
                break;
            case GameType.PublicGame:
                this.onDeckSelected = this.join;
                break;
        }
        this.router.navigate(['/select']);
    }

    private startGame(msg: Message) {
        this.analytics.eventTrack.next({ action: 'startMultiplayerGame', properties: { category: 'usage' } });

        this.ai = null;
        this.gameModel = null;
        this.playerNumber = msg.data.playerNumber;
        this.log.setPlayer(this.playerNumber);
        this.opponentNumber = 1 - this.playerNumber;
        this.log.clear();
        this.initGame();
        this.router.navigate(['/game']);
        this.soundManager.playImportantSound('gong');
        this.zone.run(() => {
            this.opponentUsername = msg.data.opponent;
            this.state = ClientState.InGame;
        });
    }

    // AI stuff ------------------------------------
    public startAIGame(scenario?: Scenario) {
        this.analytics.eventTrack.next({ action: 'startSingleplayerGame', properties: { category: 'usage' } });

        this.playerNumber = 0;
        this.opponentNumber = 1;
        this.log.clear();
        this.log.setPlayer(0);
        let aiDeck = sample(allDecks);

        // Initialize games
        this.gameModel = new ServerGame('server', standardFormat, [this.deck, aiDeck]);
        let aiModel = new ClientGame('ai',
            (type, params) => this.sendGameAction(type, params, true),
            this.overlay.getAnimator());
        this.game = new ClientGame('player',
            (type, params) => this.sendGameAction(type, params, false),
            this.overlay.getAnimator(),
            this.log);

        this.ai = new DefaultAI(1, aiModel, aiDeck, this.overlay.getAnimator());
        this.setAISpeed(this.speed.speeds.aiTick);

        this.router.navigate(['/game']);

        // scenario = tutorialCampaign[0];
        if (scenario) {
            scenario.apply(this.gameModel);
            scenario.apply(this.game);
            scenario.apply(aiModel);
        }

        this.zone.run(() => {
            this.opponentUsername = aiDeck.name;
            this.state = ClientState.InGame;
            this.sendEventsToLocalPlayers(this.gameModel.startGame());
        });
    }
}
