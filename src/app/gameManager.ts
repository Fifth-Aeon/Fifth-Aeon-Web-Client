import { Injectable, NgZone } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { SpeedService } from 'app/speed.service';
import { every, sample } from 'lodash';
import { DamageDistributionDialogComponent } from './game/damage-distribution-dialog/damage-distribution-dialog.component';
import { OverlayService } from './game/overlay.service';
import { AI } from './game_model/ai/ai';
import { DefaultAI } from './game_model/ai/defaultAi';
import { Card } from './game_model/card';
import { ClientGame } from './game_model/clientGame';
import { DeckList } from './game_model/deckList';
import { GameAction, GameActionType, GamePhase, GameSyncEvent, SyncEventType } from './game_model/game';
import { standardFormat } from './game_model/gameFormat';
import { Log } from './game_model/log';
import { Scenario } from './game_model/scenario';
import { allDecks } from './game_model/scenarios/decks';
import { ServerGame } from './game_model/serverGame';
import { Unit } from './game_model/unit';
import { MessageType, Messenger } from './messenger';
import { MessengerService } from './messenger.service';
import { SoundManager } from './sound';
import { TipService } from './tips';

@Injectable()
export class GameManager {
    private username: string;
    private opponentUsername: string;
    private deck: DeckList = new DeckList(standardFormat);
    public log: Log;
    private playerNumber: number;
    private opponentNumber: number;

    private game: ClientGame;
    private gameModel: ServerGame;
    private ai: AI;
    private aiTick: any;

    public onGameEnd: (won: boolean, quit: boolean) => any;
    private messenger: Messenger;

    constructor(
        private soundManager: SoundManager,
        private tips: TipService,
        private zone: NgZone,
        public dialog: MatDialog,
        private overlay: OverlayService,
        private speed: SpeedService,
        messengerService: MessengerService,

    ) {
        this.setAISpeed(1000);

        this.log = new Log(this.playerNumber);
        this.messenger = messengerService.getMessenger();
        this.messenger.addHandler(MessageType.GameEvent, (msg) => this.handleGameEvent(msg.data), this);
    }

    public setAISpeed(ms: number) {
        if (this.aiTick !== undefined)
            clearInterval(this.aiTick);
        this.aiTick = setInterval(() => {
            if (this.ai)
                this.ai.pulse();
        }, ms);
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

    // Decks -----------------------------------------------------
    public setDeck(deck: DeckList) {
        this.deck = deck;
    }

    public getDeck() {
        return this.deck;
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

    // Dialogs ----------------------------------------------------------
    public addBlockOverlay(blocker: string, blocked: string) {
        if (blocked === null) {
            this.overlay.removeBlocker(blocker);
            return;
        }
        if (this.game.getUnitById(blocker).getBlockedUnitId() !== null)
            this.overlay.removeBlocker(blocker);
        this.overlay.addBlocker(blocker, blocked);
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

    public getGame() {
        return this.game;
    }

    public getPlayerData() {
        return {
            me: this.playerNumber,
            op: this.opponentNumber
        };
    }

    public setUsername(username: string) {
        this.username = username;
    }

    public getUsername() {
        return this.username;
    }

    public getOpponentUsername() {
        return this.opponentUsername;
    }

    // Game Life cycle ------------------------------------------------

    /** Invoked when the game ends (because a player won) */
    private endGame(winner: number, quit: boolean) {
        const playerWon = winner === this.playerNumber;
        this.soundManager.playImportantSound(playerWon ? 'fanfare' : 'defeat');
        this.onGameEnd(playerWon, quit);
    }

    /** Invoked when we quit the game (before its over) */
    public exitGame() {
        this.sendGameAction(GameActionType.Quit, {});
    }


    /** Starts a multiplayer game */
    public startGame(playerNumber: number, opponentName: string) {
        this.ai = null;
        this.gameModel = null;
        this.playerNumber = playerNumber;
        this.opponentNumber = 1 - this.playerNumber;

        this.log.setPlayer(this.playerNumber);
        this.log.clear();

        this.game = new ClientGame('player',
            (type, params) => this.sendGameAction(type, params, false),
            this.overlay.getAnimator(),
            this.log);

        this.soundManager.playImportantSound('gong');
        this.zone.run(() => {
            this.opponentUsername = opponentName;
        });
    }

    public startAIGame(scenario?: Scenario) {

        // The player always goes first vs the A.I
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

        // scenario = tutorialCampaign[0];
        if (scenario) {
            scenario.apply(this.gameModel);
            scenario.apply(this.game);
            scenario.apply(aiModel);
        }

        this.zone.run(() => {
            this.opponentUsername = aiDeck.name;
            this.sendEventsToLocalPlayers(this.gameModel.startGame());
        });
    }
}
