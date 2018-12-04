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
import { GameAction, GameActionType, GamePhase, GameSyncEvent, SyncEventType, Game } from './game_model/game';
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
    private playerNumber: number;
    private opponentNumber: number;

    private game1: ClientGame;
    private game2: ClientGame;
    private gameModel: ServerGame;

    private ais: Array<AI> = [];
    private aisByPlayerNumber = [];
    private aiTick: any;

    private log: Log;
    private onGameEnd: (won: boolean, quit: boolean) => any;
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
        this.startAiWithSpeed(1000);

        this.messenger = messengerService.getMessenger();
        this.messenger.addHandler(MessageType.GameEvent, (msg) => this.handleGameEvent(msg.data), this);

        this.reset();
    }

    public reset() {
        this.stopAI();
        this.game1 = null;
        this.game2 = null;
        this.gameModel = null;
        this.ais = [];
    }

    private stopAI() {
        for (let ai of this.ais) {
            ai.stopActing();
        }
    }

    public startAiWithSpeed(ms: number) {
        for (let ai of this.ais) {
            ai.startActingDelayMode(ms, this.overlay.getAnimator());
        }
    }

    // Game Actions -------------------------------------------------------------------------
    public playCard(card: Card, targets: Unit[] = []) {
        this.game1.playCardExtern(card, targets);
        this.tips.playCardTrigger(card, this.game1);
    }

    public makeChoice(cards: Card[]) {
        this.game1.makeChoice(this.playerNumber, cards);
    }

    public pass() {
        this.game1.pass();
    }

    public playResource(type: string) {
        this.game1.playResource(type);
    }

    public toggleAttacker(unit: Unit) {
        this.game1.declareAttacker(unit);
    }

    public declareBlocker(blocker: Unit, blocked: Unit | null) {
        this.game1.declareBlocker(blocker, blocked);
    }

    public attackWithAll() {
        if (this.playerNumber !== this.game1.getCurrentPlayer().getPlayerNumber())
            return;
        let potential = this.game1.getCurrentPlayerUnits().filter(unit => unit.canAttack());
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

    // Action communication -------------------------------------
    private sendEventsToLocalPlayers(events: GameSyncEvent[]) {
        setTimeout(() => {
            for (let event of events) {
                for (let ai of this.ais) {
                    ai.handleGameEvent(event);
                }
                this.handleGameEvent(event);
            }
        }, 10);
    }

    private checkPriorityChange(event: GameSyncEvent) {
        if (!this.gameModel.canTakeAction())
            return;
        if (event.type === SyncEventType.TurnStart || event.type === SyncEventType.PhaseChange || event.type === SyncEventType.ChoiceMade) {
            let aiToSend = this.aisByPlayerNumber[this.gameModel.getActivePlayer()];
            if (aiToSend) aiToSend.onGainPriority();
        }
    }



    private sendGameAction(type: GameActionType, params: any, isAi: boolean = false) {
        if (this.ais.length === 0) {
            this.messenger.sendMessageToServer(MessageType.GameAction, {
                type: type,
                params: params
            } as GameAction);
            return;
        }

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

    }

    // Dialogs ----------------------------------------------------------
    public addBlockOverlay(blocker: string, blocked: string) {
        if (blocked === null) {
            this.overlay.removeBlocker(blocker);
            return;
        }
        if (this.game1.getUnitById(blocker).getBlockedUnitId() !== null)
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
                this.game1.setAttackOrder(attacker, order);
            });
    }

    private createDamageSelectors() {
        let orderables = Array.from(this.game1.getModableDamageDistributions().entries())
            .map(entry => {
                return { attacker: this.game1.getUnitById(entry[0]), blockers: entry[1] };
            });
        let runNext = () => {
            if (orderables.length === 0) {
                this.game1.pass();
                return;
            }
            let next = orderables.pop();
            this.openDamageSelector(next.attacker, next.blockers)
                .then(runNext);
        };
        runNext();
    }

    private handleGameEvent(event: GameSyncEvent) {
        // The game is being controlled by the player, so display tips and update the game state
        // (otherwise the A.I will manage this so we needn't bother)
        if (this.ais.length < 2) {
            this.zone.run(() => this.game1.syncServerEvent(this.playerNumber, event));
            this.tips.handleGameEvent(this.game1, this.playerNumber, event);
        }

        if (this.ais.length > 0)
            this.checkPriorityChange(event);

        this.soundManager.handleGameEvent(event);
        switch (event.type) {
            case SyncEventType.TurnStart:
                if (event.params.turn !== this.playerNumber)
                    return;
                break;
            case SyncEventType.EnchantmentModified:
                let avatar = this.game1.getCurrentPlayer().getPlayerNumber() === this.playerNumber ?
                    'player' : 'enemy';
                this.overlay.addInteractionArrow(avatar, event.params.enchantmentId);
                break;
            case SyncEventType.Block:
                this.addBlockOverlay(event.params.blockerId, event.params.blockedId);
                break;
            case SyncEventType.PhaseChange:
                if (event.params.phase === GamePhase.DamageDistribution && this.game1.isActivePlayer(this.playerNumber))
                    this.createDamageSelectors();
                if (event.params.phase === GamePhase.Play2)
                    this.overlay.clearBlockers();
                break;
            case SyncEventType.PlayCard:
                this.overlay.onPlay(this.game1.getCardById(event.params.played.id), this.game1, this.playerNumber);
                break;
            case SyncEventType.Ended:
                this.endGame(event.params.winner, event.params.quit);
                break;
        }
    }

    public getGame() {
        return this.game1;
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

    public setGameEndCallback(newCallback: (won: boolean, quit: boolean) => any) {
        this.onGameEnd = newCallback;
    }

    public getLog() {
        return this.log;
    }

    public isInputEnabled() {
        return this.ais.length < 2;
    }

    // Game Life cycle ------------------------------------------------

    /** Invoked when the game ends (because a player won) */
    private endGame(winner: number, quit: boolean) {
        const playerWon = winner === this.playerNumber;
        this.soundManager.playImportantSound(playerWon ? 'fanfare' : 'defeat');
        this.soundManager.setFactionContext(new Set());
        this.stopAI();
        this.overlay.getAnimator().awaitAnimationEnd().then(() => {
            this.onGameEnd(playerWon, quit);
        });
    }

    /** Invoked when we quit the game (before its over) */
    public exitGame() {
        this.sendGameAction(GameActionType.Quit, {});
    }


    /** Starts a multiplayer game */
    public startGame(playerNumber: number, opponentName: string) {
        this.soundManager.setFactionContext(this.deck.getColors());
        this.ais = [];
        this.gameModel = null;
        this.playerNumber = playerNumber;
        this.opponentNumber = 1 - this.playerNumber;

        this.log = new Log(this.playerNumber);

        this.game1 = new ClientGame('player',
            (type, params) => this.sendGameAction(type, params, false),
            this.overlay.getAnimator(),
            this.log);
        this.game1.setOwningPlayer(this.playerNumber);


        this.soundManager.playImportantSound('gong');
        this.zone.run(() => {
            this.opponentUsername = opponentName;
        });
    }

    public startAIGame(aiCount = 1, scenario?: Scenario) {
        this.soundManager.setFactionContext(this.deck.getColors());
        this.reset();
        ServerGame.setSeed(new Date().getTime());

        // The player always goes first vs the A.I
        this.playerNumber = 0;
        this.opponentNumber = 1;
        this.log = new Log(this.playerNumber);
        let aiDeck = sample(allDecks);

        // Initialize games
        this.gameModel = new ServerGame('server', standardFormat, [this.deck, aiDeck]);
        this.game1 = new ClientGame('player',
            (type, params) => this.sendGameAction(type, params, false),
            this.overlay.getAnimator(),
            this.log);
        this.game1.setOwningPlayer(this.playerNumber);
        this.game2 = new ClientGame('ai',
            (type, params) => this.sendGameAction(type, params, true),
            this.overlay.getAnimator());
        this.game2.setOwningPlayer(this.opponentNumber);

        if (aiCount === 1) {
            let newAI = new DefaultAI(this.opponentNumber, this.game2, aiDeck);

            this.ais.push(newAI);
            this.aisByPlayerNumber = [undefined, newAI];
        } else {
            const aiGames = [this.game1, this.game2];
            for (let i = 0; i < aiCount; i++) {
                let newAI = new DefaultAI(i, aiGames[i], aiDeck);
                this.ais.push(newAI);
                this.aisByPlayerNumber.push(newAI);
            }
        }

        // scenario = tutorialCampaign[0];
        if (scenario) {
            this.applyScenario(scenario, [this.gameModel, this.game1, this.game2]);
        }

        this.zone.run(() => {
            this.opponentUsername = aiDeck.name;
            this.sendEventsToLocalPlayers(this.gameModel.startGame());
            this.startAiWithSpeed(this.speed.speeds.aiTick);
        });
    }

    private applyScenario(scenario: Scenario, games: Array<Game>) {
        games.forEach(game => {
            scenario.apply(game);
        });
    }
}
