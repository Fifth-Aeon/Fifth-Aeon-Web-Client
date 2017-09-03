import { Game, GameActionType, GamePhase, GameAction, GameSyncEvent, SyncEventType } from './game_model/game';
import { Resource, ResourceTypeNames } from './game_model/resource';
import { Player } from './game_model/player';
import { Card } from './game_model/card';
import { Unit } from './game_model/unit';

import { minBy, sample, sampleSize, maxBy, sortBy } from 'lodash';
import { LinkedList } from 'typescript-collections';


export enum AiDifficulty {
    Easy, Medium, Hard
}

/*
AI Plan

On my turn
1. Play resource
2. Analyze playable cards
3. Play cards useful for combat (eg, remove blockers)
4. Maybe attack
5. Play cards not useful for combat (eg, non fast units)

During my opponents turn
1. Analyze block
*/

export abstract class AI {
    constructor(
        protected playerNumber: number,
        protected game: Game,
        protected runGameAction: (type: GameActionType, params: any) => void
    ) { }

    abstract handleGameEvent(event: GameSyncEvent);
    abstract pulse();
}

export class BasicAI extends AI {
    private eventHandlers: Map<SyncEventType, (params: any) => void> = new Map();
    private enemyNumber: number;
    private aiPlayer: Player;
    private actionSequence: LinkedList<() => void> = new LinkedList();

    constructor(playerNumber: number, game: Game, runGameAction: (type: GameActionType, params: any) => void) {
        super(playerNumber, game, runGameAction);
        this.aiPlayer = this.game.getPlayer(this.playerNumber);
        this.enemyNumber = this.game.getOtherPlayerNumber(this.playerNumber);

        this.game.promptCardChoice = this.makeChoice.bind(this);
        this.eventHandlers.set(SyncEventType.TurnStart, event => this.onTurnStart(event.params));
        this.eventHandlers.set(SyncEventType.PhaseChange, event => this.onPhaseChange(event.params));
        this.eventHandlers.set(SyncEventType.ChoiceMade, event => this.continue());
    }

    public pulse() {
        this.continue();
    }

    private addActionToSequence(action: () => void, front: boolean = false) {
        this.actionSequence.add(action.bind(this), front ? 0 : this.actionSequence.size());
    }

    private sequenceActions(actions: Array<() => void>) {
        this.actionSequence = new LinkedList();
        for (let action of actions) {
            this.addActionToSequence(action);
        }
    }

    private dequeue(): () => void {
        let val = this.actionSequence.first();
        this.actionSequence.remove(val);
        return val;
    }

    private continue() {
        if (!this.game.canTakeAction() || !this.game.isActivePlayer(this.playerNumber))
            return;
        let next = this.dequeue() || this.pass.bind(this);
        next();
    }

    private getBestTarget(card: Card) {
        let targets = card.getTargeter().getValidTargets(card, this.game);
        return maxBy(targets, target => card.evaluateTarget(target));
    }

    private evaluateCard(card: Card) {
        let score = 0;
        if (card.getTargeter().needsInput()) {
            let best = this.getBestTarget(card);
            score += card.evaluateTarget(best);
        }
        return score + card.evaluate();
    }

    private makeChoice(player: number, cards: Array<Card>, toPick: number = 1, callback: (cards: Card[]) => void = null) {
        this.game.setDeferedChoice(this.playerNumber, callback);
        if (player != this.playerNumber) {
            console.log('A.I skip choice', player, this.playerNumber);
            return;
        }
        let choice = sampleSize(cards, toPick);
        console.log('A.I make choice', choice)
        if (callback) {
            this.game.makeDeferedChoice(choice);
            this.runGameAction(GameActionType.CardChoice, {
                choice: choice.map(card => card.getId())
            });
        }
    }

    public handleGameEvent(event: GameSyncEvent) {
        this.game.syncServerEvent(this.playerNumber, event);
        console.log('A.I event -', SyncEventType[event.type], event.params, this.eventHandlers.get(event.type));
        if (this.eventHandlers.has(event.type))
            this.eventHandlers.get(event.type)(event);
    }


    private onTurnStart(params: any) {
        if (this.playerNumber !== params.turn)
            return;
        this.playResource();
        this.sequenceActions([this.selectCardToPlay, this.attack]);
    }

    private selectCardToPlay() {
        let playable = this.aiPlayer.getHand().filter(card => card.isPlayable(this.game));
        console.log('hand', this.aiPlayer.getHand());
        if (playable.length > 0) {
            console.log('eval', sortBy(playable, card => -this.evaluateCard(card))
                .map(card => card.getName() + ' ' + this.evaluateCard(card)).join(' | '));
            let toPlay = maxBy(playable, card => this.evaluateCard(card));
            if (toPlay.getTargeter().needsInput() && this.getBestTarget(toPlay))
                this.playCard(toPlay, [this.getBestTarget(toPlay)]);
            else
                this.playCard(toPlay);
            this.addActionToSequence(this.selectCardToPlay, true);
        }
    }

    public playCard(card: Card, targets: Unit[] = []) {
        let targetIds = targets.map(target => target.getId());
        card.getTargeter().setTargets(targets);
        this.runGameAction(GameActionType.PlayCard, { id: card.getId(), targetIds: targetIds });
        this.game.playCard(this.aiPlayer, card);

    }

    private playResource() {
        let hand = this.aiPlayer.getHand();
        let total = new Resource(0);
        for (let card of hand) {
            total.add(card.getCost());
        }
        let toPlay = maxBy(ResourceTypeNames, type => total.getOfType(type));
        this.runGameAction(GameActionType.PlayResource, { type: toPlay });
    }


    private pass() {
        this.runGameAction(GameActionType.Pass, {});
    }

    private attack() {
        let potentialAttackers = this.game.getBoard().getPlayerUnits(this.playerNumber)
            .filter(unit => unit.canAttack())
        let potentialBlockers = this.game.getBoard().getPlayerUnits(this.enemyNumber)
            .filter(unit => !unit.isExausted());
        let attacked = false;
        for (let attacker of potentialAttackers) {
            let hasBlocker = false;
            for (let blocker of potentialBlockers) {
                if (this.canFavorablyBlock(attacker, blocker)) {
                    hasBlocker = true;
                    break;
                }
            }
            if (!hasBlocker) {
                this.declareAttacker(attacker);
                attacked = true;
            }
        }
        if (attacked)
            this.addActionToSequence(this.pass);
    }

    private canFavorablyBlock(attacker: Unit, blocker: Unit) {
        return blocker.canBlock(attacker, true) && blocker.getLife() > attacker.getDamage()
    }

    private declareAttacker(unit: Unit) {
        unit.toggleAttacking();
        this.runGameAction(GameActionType.ToggleAttack, { unitId: unit.getId() });
    }

    private makeBlockAction(params: { blocker: Unit, attacker: Unit }) {
        return () => {
            this.declareBlocker(params.blocker, params.attacker);
        }
    }

    private block() {
        let attackers = this.game.getAttackers().sort((a, b) => a.getDamage() - b.getDamage());
        let potentialBlockers = this.game.getBoard().getPlayerUnits(this.playerNumber)
            .filter(unit => !unit.isExausted());
        let blocks = [];
        for (let attacker of attackers) {
            for (let blocker of potentialBlockers) {
                if (this.canFavorablyBlock(attacker, blocker)) {
                    potentialBlockers.splice(potentialBlockers.indexOf(blocker), 1);
                    blocks.push({ blocker: blocker, attacker: attacker });
                }
            }
        }
        let actions = blocks.map(block => {
            return this.makeBlockAction(block)
        });
        this.sequenceActions(actions);
    }

    private declareBlocker(blocker: Unit, attacker: Unit) {
        blocker.setBlocking(attacker.getId());
        this.runGameAction(GameActionType.DeclareBlocker, {
            blockerId: blocker.getId(),
            blockedId: attacker.getId()
        });
    }

    private onPhaseChange(params: any) {
        if (params.phase === GamePhase.Block && this.game.isActivePlayer(this.playerNumber))
            this.block()
        if (params.phase === GamePhase.Play2 && this.game.isActivePlayer(this.playerNumber)) {
            this.pass();
        }
    }
}