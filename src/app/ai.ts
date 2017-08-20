import { Game, GameActionType, GamePhase, GameAction, SyncGameEvent, GameEventType } from './game_model/game';
import { Resource, ResourceTypeNames } from './game_model/resource';
import { Player } from './game_model/player';
import { Card } from './game_model/card';
import { Unit } from './game_model/unit';

import { minBy, sample, sampleSize, maxBy, sortBy } from 'lodash';

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

    abstract handleGameEvent(event: SyncGameEvent);
}

export class BasicAI extends AI {
    private eventHandlers: Map<GameEventType, (params: any) => void> = new Map();
    private enemyNumber: number;
    private aiPlayer: Player;

    constructor(playerNumber: number, game: Game, runGameAction: (type: GameActionType, params: any) => void) {
        super(playerNumber, game, runGameAction);
        this.aiPlayer = this.game.getPlayer(this.playerNumber);
        this.enemyNumber = this.game.getOtherPlayerNumber(this.playerNumber);

        this.game.promptCardChoice = this.makeChoice.bind(this);
        this.eventHandlers.set(GameEventType.turnStart, event => this.onTurnStart(event.params));
        this.eventHandlers.set(GameEventType.phaseChange, event => this.onPhaseChange(event.params));
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
        let choice = sampleSize(cards, toPick);
        if (callback) {
            callback(choice);
            this.runGameAction(GameActionType.CardChoice, { choice: choice.map(card => card.getId()) });
        }
    }

    public handleGameEvent(event: SyncGameEvent) {
        this.game.syncServerEvent(this.playerNumber, event);
        console.log('AI', GameEventType[event.type], event.params, this.eventHandlers.get(event.type));
        if (this.eventHandlers.has(event.type))
            this.eventHandlers.get(event.type)(event);
    }

    private onTurnStart(params: any) {
        if (this.playerNumber !== params.turn)
            return;
        this.playResource();
        
        if (!this.attack()) {
            console.log('no attack')
            this.selectCardToPlay();
            this.pass();
        } else {
            console.log('an attack');
        }
    }

    private selectCardToPlay() {
        let playable = this.aiPlayer.getHand().filter(card => card.isPlayable(this.game));
        console.log('playable', playable, 'hand', this.aiPlayer.getHand())
        if (playable.length > 0) {
            console.log('eval', sortBy(playable, card => -this.evaluateCard(card))
                .map(card => card.getName() + ' ' + this.evaluateCard(card)).join(' | '))
            let toPlay = maxBy(playable, card => this.evaluateCard(card));
            if (toPlay.getTargeter().needsInput() && this.getBestTarget(toPlay))
                this.playCard(toPlay, [this.getBestTarget(toPlay)]);
            else
                this.playCard(toPlay);
            this.selectCardToPlay();
        }
    }

    public playCard(card: Card, targets: Unit[] = []) {
        let targetIds = targets.map(target => target.getId());
        card.getTargeter().setTargets(targets);
        this.game.playCard(this.aiPlayer, card);
        this.runGameAction(GameActionType.playCard, { id: card.getId(), targetIds: targetIds });
    }

    private playResource() {
        let hand = this.aiPlayer.getHand();
        let total = new Resource(0);
        for (let card of hand) {
            total.add(card.getCost());
        }
        let toPlay = maxBy(ResourceTypeNames, type => total.getOfType(type));
        this.runGameAction(GameActionType.playResource, { type: toPlay });
    }

    private delay(cb: () => void, ms = 1000) {
        window.setTimeout(cb, ms);
    }

    private pass() {
        this.runGameAction(GameActionType.pass, {});
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
        if (attacked) {
            this.delay(() => this.pass());
            return true;
        }
        return false;
    }

    private canFavorablyBlock(attacker: Unit, blocker: Unit) {
        return blocker.canBlock(attacker, true) && blocker.getLife() > attacker.getDamage()
    }

    private declareAttacker(unit: Unit) {
        unit.toggleAttacking();
        this.runGameAction(GameActionType.toggleAttack, { unitId: unit.getId() });
    }

    private block() {
        let attackers = this.game.getAttackers().sort((a, b) => a.getDamage() - b.getDamage());
        let potentialBlockers = this.game.getBoard().getPlayerUnits(this.playerNumber)
            .filter(unit => !unit.isExausted());
        let blocked = false;
        for (let attacker of attackers) {
            for (let blocker of potentialBlockers) {
                if (this.canFavorablyBlock(attacker, blocker)) {
                    this.declareBlocker(blocker, attacker);
                    potentialBlockers.splice(potentialBlockers.indexOf(blocker), 1);
                    blocked = true;
                }
            }
        }
        this.delay(() => this.pass(), blocked ? 2000 : 0);
    }

    private declareBlocker(blocker: Unit, blocked: Unit) {
        blocker.setBlocking(blocker.getId());
        this.runGameAction(GameActionType.declareBlockers, {
            blockerId: blocker.getId(),
            blockedId: blocked.getId()
        });
    }

    private onPhaseChange(params: any) {
        if (params.phase === GamePhase.combat && this.game.isActivePlayer(this.playerNumber))
            this.block()
        if (params.phase === GamePhase.play2 && this.game.isActivePlayer(this.playerNumber)) {
            this.selectCardToPlay()
            this.pass();
        }
    }
}