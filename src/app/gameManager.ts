import { Injectable, NgZone } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SpeedService } from 'app/speed.service';
import { every, sample } from 'lodash';
import { DamageDistributionDialogComponent } from './game/damage-distribution-dialog/damage-distribution-dialog.component';
import { OverlayService } from './game/overlay.service';
import { AI } from './game_model/ai/ai';
import { DefaultAI } from './game_model/ai/defaultAi';
import { ClientGame } from './game_model/clientGame';
import { DeckList } from './game_model/deckList';
import { GameAction, GameActionType } from './game_model/events/gameAction';
import { GameSyncEvent, SyncEventType } from './game_model/events/syncEvent';
import { Game, GamePhase } from './game_model/game';
import { standardFormat } from './game_model/gameFormat';
import { Log } from './game_model/log';
import { Scenario } from './game_model/scenario';
import { allDecks } from './game_model/scenarios/decks';
import { ServerGame } from './game_model/serverGame';
import { Unit } from './game_model/card-types/unit';
import { MessageType, Messenger } from './messenger';
import { MessengerService } from './messenger.service';
import { SoundManager } from './sound';
import { TipService } from './tips';
import { GameType } from './client';
import { aiManager } from './game_model/aiManager';

@Injectable()
export class GameManager {
    private username = '';
    private opponentUsername = '';
    private deck: DeckList = new DeckList(standardFormat);
    private playerNumber = 0;
    private opponentNumber = 1;

    private game1: ClientGame | null = null;
    private game2: ClientGame | null = null;
    private gameModel: ServerGame | null = null;

    private ais: Array<AI> = [];
    private aisByPlayerNumber: Array<AI | null> = [];

    private log: Log | null = null;
    private onGameEnd: ((won: boolean, quit: boolean) => any) | null = null;
    private messenger: Messenger;
    private localMessenger: Messenger;

    private gameType: GameType = GameType.AiGame;

    constructor(
        private soundManager: SoundManager,
        private tips: TipService,
        private zone: NgZone,
        public dialog: MatDialog,
        private overlay: OverlayService,
        private speed: SpeedService,
        messengerService: MessengerService
    ) {
        this.startAiWithSpeed(1000);

        this.messenger = messengerService.getMessenger();
        this.messenger.addHandler(
            MessageType.GameEvent,
            msg => this.handleGameEvent(msg.data),
            this
        );

        this.localMessenger = messengerService.getLocalMessenger();
        this.localMessenger.addHandler(MessageType.GameEvent, msg => {
            this.handleGameEvent(msg.data);
        });
        this.localMessenger.addHandler(MessageType.TransferScenario, msg => {
            const scenario = new Scenario(msg.data.scenario);
            if (this.game1) {
                scenario.apply(this.game1);
            }
        });

        this.setupAiManager();

        this.reset();
    }

    private setupAiManager() {
        const localStorageKey = 'ai-data';
        aiManager.save = data => localStorage.setItem(localStorageKey, JSON.stringify(data));

        const json = localStorage.getItem(localStorageKey);
        if (json) {
            aiManager.load(JSON.parse(json));
        }
    }

    public reset() {
        this.stopAI();
        this.game1 = null;
        this.game2 = null;
        this.gameModel = null;
        this.ais = [];
    }

    private stopAI() {
        for (const ai of this.ais) {
            ai.stopActing();
        }
    }

    public startAiWithSpeed(ms: number) {
        for (const ai of this.ais) {
            ai.startActingDelayMode(ms, this.overlay.getAnimator());
        }
    }

    // Game Actions -------------------------------------------------------------------------
    public attackWithAll() {
        const game = this.game1;
        if (
            !game ||
            this.playerNumber !== game.getCurrentPlayer().getPlayerNumber()
        ) {
            return;
        }
        const potential = game
            .getCurrentPlayerUnits()
            .filter(unit => unit.canAttack());
        const allAttacking = every(potential, unit => unit.isAttacking());
        potential.forEach(unit => {
            if (allAttacking || !unit.isAttacking()) {
                game.declareAttacker(unit);
            }
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
            for (const event of events) {
                for (const ai of this.ais) {
                    ai.handleGameEvent(event);
                }
                this.handleGameEvent(event);
            }
        }, 10);
    }

    private checkPriorityChange(event: GameSyncEvent) {
        if (!this.gameModel || !this.gameModel.canTakeAction()) {
            return;
        }
        if (
            event.type === SyncEventType.TurnStart ||
            event.type === SyncEventType.PhaseChange ||
            event.type === SyncEventType.ChoiceMade
        ) {
            const aiToSend = this.aisByPlayerNumber[
                this.gameModel.getActivePlayer()
            ];
            if (aiToSend) {
                aiToSend.onGainPriority();
            }
        }
    }

    private sendGameAction(action: GameAction, isAi: boolean = false) {
        if (this.gameType === GameType.PublicGame) {
            this.messenger.sendMessageToServer(MessageType.GameAction, action);
            return;
        } else if (this.gameType === GameType.ServerAIGame) {
            if (this.localMessenger) {
                this.localMessenger.sendMessageToServer(
                    MessageType.GameAction,
                    action
                );
            }
            return;
        }

        if (!this.gameModel) {
            console.warn('Sent action to empty game model');
            return;
        }

        const res = this.gameModel.handleAction(action);
        if (res === null) {
            console.error(
                'An action sent to game model by',
                isAi ? 'the A.I' : 'the player',
                'failed.',
                'It was',
                GameActionType[action.type],
                'with',
                action
            );
            return;
        }
        this.sendEventsToLocalPlayers(res);
    }

    // Dialogs ----------------------------------------------------------
    public addBlockOverlay(blocker: string, blocked: string | null) {
        if (blocked === null) {
            this.overlay.removeBlocker(blocker);
            return;
        }
        const game = this.game1;
        if (
            game !== null &&
            game.getUnitById(blocker).getBlockedUnitId() !== null
        ) {
            this.overlay.removeBlocker(blocker);
        }
        this.overlay.addBlocker(blocker, blocked);
    }

    private openDamageSelector(attacker: Unit, defenders: Unit[]) {
        const config = new MatDialogConfig();
        config.disableClose = true;
        const dialogRef = this.dialog.open(
            DamageDistributionDialogComponent,
            config
        );

        dialogRef.componentInstance.attacker = attacker;
        dialogRef.componentInstance.defenders = defenders;

        return dialogRef
            .afterClosed()
            .toPromise()
            .then((order: Unit[]) => {
                const game = this.game1;
                if (!game) {
                    throw new Error('Game has not started.');
                }
                game.setAttackOrder(attacker, order);
            });
    }

    private createDamageSelectors() {
        const playerGame = this.game1;
        if (!playerGame) {
            throw new Error('Games not in progress');
        }
        const orderables = Array.from(
            playerGame.getModableDamageDistributions().entries()
        ).map(entry => {
            return {
                attacker: playerGame.getUnitById(entry[0]),
                blockers: entry[1]
            };
        });
        const runNext = () => {
            if (orderables.length === 0) {
                playerGame.pass();
                return;
            }
            const next = orderables.pop();
            if (next) {
                this.openDamageSelector(next.attacker, next.blockers).then(
                    runNext
                );
            }
        };
        runNext();
    }

    private handleGameEvent(event: GameSyncEvent) {
        const playerGame = this.game1;
        if (!playerGame) {
            throw new Error('Games not in progress');
        }

        // The game is being controlled by the player, so display tips and update the game state
        // (otherwise the A.I will manage this so we needn't bother)
        if (this.ais.length < 2) {
            this.zone.run(() =>
                playerGame.syncServerEvent(this.playerNumber, event)
            );
            this.tips.handleGameEvent(playerGame, this.playerNumber, event);
        }

        if (this.ais.length > 0) {
            this.checkPriorityChange(event);
        }

        this.soundManager.handleGameEvent(event);
        switch (event.type) {
            case SyncEventType.TurnStart:
                if (event.turn !== this.playerNumber) {
                    return;
                }
                break;
            case SyncEventType.EnchantmentModified:
                const avatar =
                    playerGame.getCurrentPlayer().getPlayerNumber() ===
                    this.playerNumber
                        ? 'player'
                        : 'enemy';
                this.overlay.addInteractionArrow(avatar, event.enchantmentId);
                break;
            case SyncEventType.Block:
                this.addBlockOverlay(event.blockerId, event.blockedId);
                break;
            case SyncEventType.PhaseChange:
                if (
                    event.phase === GamePhase.DamageDistribution &&
                    playerGame.isActivePlayer(this.playerNumber)
                ) {
                    this.createDamageSelectors();
                }
                if (event.phase === GamePhase.Play2) {
                    this.overlay.clearBlockers();
                }
                break;
            case SyncEventType.PlayCard:
                this.overlay.onPlay(
                    playerGame.getCardById(event.played.id),
                    playerGame,
                    this.playerNumber
                );
                break;
            case SyncEventType.Ended:
                this.endGame(event.winner, event.quit);
                break;
        }
    }

    public getGame(): ClientGame | null {
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

    public setGameEndCallback(
        newCallback: (won: boolean, quit: boolean) => any
    ) {
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
        this.stopAI();
        this.overlay
            .getAnimator()
            .awaitAnimationEnd()
            .then(() => {
                aiManager.recordGameResult(playerWon);
                if (this.onGameEnd) {
                    this.onGameEnd(playerWon, quit);
                } else {
                    console.warn('No Game end callback');
                }
            });

        this.soundManager
            .playImportantSound(playerWon ? 'fanfare' : 'defeat')
            .then(() => {
                if (!this.gameModel) {
                    this.soundManager.setFactionContext(new Set());
                }
            });
    }

    /** Invoked when we quit the game (before its over) */
    public exitGame() {
        this.sendGameAction({
            type: GameActionType.Quit,
            player: this.playerNumber
        });
    }

    /** Starts a multiplayer game */
    public startMultiplayerGame(playerNumber: number, opponentName: string) {
        this.gameType = GameType.PublicGame;
        this.soundManager.setFactionContext(this.deck.getColors());
        this.ais = [];
        this.gameModel = null;
        this.playerNumber = playerNumber;
        this.opponentNumber = 1 - this.playerNumber;

        this.log = new Log(this.playerNumber);

        this.game1 = new ClientGame(
            'player',
            (_, action) => this.sendGameAction(action, false),
            this.overlay.getAnimator(),
            this.log
        );

        this.game1.enableAnimations();
        this.game1.setOwningPlayer(this.playerNumber);

        this.soundManager.playImportantSound('gong');
        this.zone.run(() => {
            this.opponentUsername = opponentName;
        });
    }

    public async startAiServerGame() {
        this.gameType = GameType.ServerAIGame;
        this.playerNumber = Math.random() > 0.5 ? 1 : 0;
        this.opponentNumber = 1 - this.playerNumber;
        this.localMessenger.sendMessageToServer(MessageType.StartGame, {
            playerNumber: this.opponentNumber,
            deck: this.deck.getSavable()
        });

        this.soundManager.setFactionContext(this.deck.getColors());
        this.ais = [];
        this.gameModel = null;

        this.log = new Log(this.playerNumber);

        this.game1 = new ClientGame(
            'player',
            (_, action) => this.sendGameAction(action, false),
            this.overlay.getAnimator(),
            this.log
        );
        this.game1.setOwningPlayer(this.playerNumber);
        this.game1.enableAnimations();

        this.soundManager.playImportantSound('gong');
        this.zone.run(() => {
            this.opponentUsername = 'Server A.I';
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

        const matchup = aiManager.getLeveledOpponent();
        const aiDeck = matchup.deck;

        // Initialize games
        this.gameModel = new ServerGame('server', standardFormat, [
            this.deck,
            aiDeck
        ]);
        this.game1 = new ClientGame(
            'player',
            (_, action) => this.sendGameAction(action, false),
            this.overlay.getAnimator(),
            this.log
        );
        this.game1.setOwningPlayer(this.playerNumber);
        this.game1.enableAnimations();
        this.game2 = new ClientGame(
            'ai',
            (_, action) => this.sendGameAction(action, true),
            this.overlay.getAnimator()
        );
        this.game2.setOwningPlayer(this.opponentNumber);

        if (aiCount === 1) {
            this.gameType = GameType.AiGame;

            const newAI = new matchup.ai(
                this.opponentNumber,
                this.game2,
                aiDeck
            );

            this.ais.push(newAI);
            this.aisByPlayerNumber = [null, newAI];
        } else {
            this.gameType = GameType.DoubleAiGame;

            const aiGames = [this.game1, this.game2];
            for (let i = 0; i < aiCount; i++) {
                const newAI = new DefaultAI(i, aiGames[i], aiDeck);
                this.ais.push(newAI);
                this.aisByPlayerNumber.push(newAI);
            }
        }

        // scenario = tutorialCampaign[0];
        if (scenario) {
            this.applyScenario(scenario, [
                this.gameModel,
                this.game1,
                this.game2
            ]);
        }

        this.zone.run(() => {
            this.opponentUsername = aiDeck.name;
            if (this.gameModel) {
                this.sendEventsToLocalPlayers(this.gameModel.startGame());
            }
            this.startAiWithSpeed(this.speed.speeds.aiTick);
        });
    }

    private applyScenario(scenario: Scenario, games: Array<Game>) {
        games.forEach(game => {
            scenario.apply(game);
        });
    }
}
