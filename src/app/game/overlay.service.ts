import { Injectable } from '@angular/core';
import { remove } from 'lodash';
import { Animator, BattleAnimationEvent } from '../game_model/animator';
import { Card, CardType } from '../game_model/card-types/card';
import { ClientGame } from '../game_model/clientGame';
import { Game } from '../game_model/game';
import { Item } from '../game_model/card-types/item';
import { Unit } from '../game_model/card-types/unit';
import { Permanent } from 'app/game_model/card-types/permanent';

interface Arrow {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
interface TextElement {
    text: string;
    x: number;
    y: number;
}

@Injectable()
export class OverlayService {
    public static arrowTimer = 2000;
    public static cardTimer = 3500;

    public displayCards: Card[] = [];
    public attacker?: Unit;
    public defenders: Unit[] = [];
    public targets: Array<Arrow> = [];
    public textElements: TextElement[] = [];
    public game?: ClientGame;
    public darkened = false;

    private uiElements: Map<string, string> = new Map();
    private blocks: Array<[string, string]> = [];
    private animator: Animator = new Animator();

    constructor() {
        this.animator.addBattleAnimationHandler(event =>
            this.animateBattle(event)
        );
        this.animator.addDamageIndicatorEventHandler(event =>
            this.createDamageIndicator(event.targetCard, event.amount)
        );
    }

    private async animateBattle(event: BattleAnimationEvent) {
        if (!this.game) {
            throw new Error('Overlay cannot animate when not attached to a game');
        }
        this.defenders = event.defenders;
        if (event.defenders.length === 0) {
            const defendingPlayer = this.game.getPlayer(
                this.game.getOtherPlayerNumber(
                    this.game.getCurrentPlayer().getPlayerNumber()
                )
            );
            this.defenders = [defendingPlayer];
        }
        this.darkened = true;
        this.attacker = event.attacker;

        await this.animator.getAnimationDelay();

        this.defenders = [];
        this.attacker = undefined;
        this.darkened = false;
    }

    public getAnimator() {
        return this.animator;
    }

    private createDamageIndicator(cardId: string, amount: number) {
        const cardBounds = this.getBoundingRect(cardId);
        if (!cardBounds) {
            return;
        }
        const textElement: TextElement = {
            text: amount.toString(),
            x: this.getRndPointBetween(
                cardBounds.right,
                cardBounds.left,
                pageXOffset
            ),
            y: this.getRndPointBetween(
                cardBounds.top,
                cardBounds.bottom,
                pageYOffset
            )
        };
        this.textElements.push(textElement);
        setTimeout(() => this.textElements.shift(), 3100);
    }

    public setGame(game: ClientGame) {
        this.game = game;
    }

    public addInteractionArrow(from: string, to: string) {
        const arrow = this.toArrow([from, to]);
        if (!arrow) {
            return;
        }
        this.targets.push(arrow);
        setTimeout(() => {
            remove(this.targets, arrow);
        }, OverlayService.arrowTimer);
    }

    public registerUIElement(id: string, htmlId: string) {
        this.uiElements.set(id, htmlId);
    }

    public addBlocker(id: string, target: string) {
        this.blocks.push([id, target]);
    }

    public removeBlocker(toRemove: string) {
        remove(this.blocks, block => block[0] === toRemove);
    }

    public clearBlockers() {
        this.blocks = [];
    }

    public addTargets(card: Card, targets: Array<Permanent>) {
        if (!(card instanceof Unit)) {
            this.displayCards.push(card);
            setTimeout(() => {
                remove(this.displayCards, card);
            }, OverlayService.cardTimer);
        }
        if (targets !== null && targets.length > 0) {
            setTimeout(() => {
                const newTargets = targets
                    .map(
                        target =>
                            [card.getId(), target.getId()] as [string, string]
                    )
                    .map(target => this.toArrow(target))
                    .filter(arrow => arrow !== null) as Arrow[];
                this.targets = this.targets.concat(newTargets);
                setTimeout(() => {
                    const toRemove = new Set(newTargets);
                    remove(this.targets, target => toRemove.has(target));
                }, OverlayService.arrowTimer);
            }, 0);
        }
    }

    public onPlay(card: Card, game: Game, player: number) {
        const targets = card.getTargeter().getLastTargets();
        if (card.getCardType() === CardType.Item) {
            targets.push((card as Item).getHostTargeter().getLastTargets()[0]);
        }
        this.addTargets(card, targets);
    }

    private getBoundingRect(sourceId: string): ClientRect | undefined {
        let id = this.uiElements.get(sourceId);
        if (!id) {
            id = 'card-' + sourceId;
        }
        const element = document.getElementById(id);
        if (!element) {
            console.error('no element for', sourceId);
            return;
        }
        return element.getBoundingClientRect();
    }

    private toArrow(pair: [string, string]): Arrow | null {
        const startRect = this.getBoundingRect(pair[0]);
        const endRect = this.getBoundingRect(pair[1]);
        if (!startRect || !endRect) {
            console.error('Could not form arrow from', pair);
            return null;
        }
        return {
            x1: this.getCenter(startRect.right, startRect.left, pageXOffset),
            y1: this.getCenter(startRect.top, startRect.bottom, pageYOffset),
            x2: this.getCenter(endRect.right, endRect.left, pageXOffset),
            y2: this.getCenter(endRect.top, endRect.bottom, pageYOffset)
        };
    }

    public getBlockArrows(): Arrow[] {
        return this.blocks
            .map(block => this.toArrow(block))
            .filter(arrow => arrow !== null) as Arrow[];
    }

    public getRndPointBetween(a: number, b: number, offset: number): number {
        const center = this.getCenter(a, b, offset);
        const centerOffset = (b - a) * (0.5 - Math.random()) * 0.3;
        return center + centerOffset;
    }

    public getCenter(a: number, b: number, offset: number): number {
        return (a + b + offset * 2) / 2;
    }
}
