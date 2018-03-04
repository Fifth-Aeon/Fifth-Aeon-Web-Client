import { Injectable, ElementRef } from '@angular/core';
import { remove } from 'lodash';

import { Unit } from 'app/game_model/unit';
import { Card, CardType } from 'app/game_model/card';
import { Item } from 'app/game_model/item';
import { Game } from 'app/game_model/game';
import { ClientGame } from './game_model/clientGame';


interface Arrow { x1: number; y1: number; x2: number; y2: number; }

@Injectable()
export class OverlayService {
  public static arrowTimer = 2000;
  public static cardTimer = 3500;

  public displayCards: Card[] = [];
  private uiElements: Map<string, string> = new Map();
  private blocks: Array<[string, string]> = [];
  public targets: Array<Arrow> = [];
  public game: ClientGame;


  constructor() { }

  public setGame(game: ClientGame) {
    this.game = game;
  }

  public addInteractionArrow(from: string, to: string) {
    let arrow = this.toArrow([from, to]);
    if (!arrow) return;
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
    remove(this.blocks, (block) => block[0] === toRemove);
  }

  public clearBlockers() {
    this.blocks = [];
  }

  public addTargets(card: Card, targets: Array<Unit>) {
    if (!card.isUnit()) {
      this.displayCards.push(card);
      setTimeout(() => {
        remove(this.displayCards, card);
      }, OverlayService.cardTimer);
    }
    if (targets !== null && targets.length > 0) {
      setTimeout(() => {
        let newTargets = targets
          .map(target => [card.getId(), target.getId()] as [string, string])
          .map((target) => this.toArrow(target))
          .filter(arrow => arrow !== null);
        this.targets = this.targets.concat(newTargets);
        setTimeout(() => {
          let toRemove = new Set(newTargets);
          remove(this.targets, target => toRemove.has(target));
        }, OverlayService.arrowTimer);
      }, 0);
    }
  }

  public onPlay(card: Card, game: Game, player: number) {
    let targets = card.getTargeter().getLastTargets();
    if (card.getCardType() === CardType.Item) {
      targets.push((card as Item).getHostTargeter().getLastTargets()[0]);
    }
    this.addTargets(card, targets);
  }

  private getBoundingRect(sourceId: string): ClientRect {
    let id = this.uiElements.get(sourceId);
    if (!id) {
      id = 'card-' + sourceId;
    }
    let element = document.getElementById(id);
    if (!element) {
      console.error('no element for', sourceId);
      return;
    }
    return element.getBoundingClientRect();
  }

  private toArrow(pair: [string, string]): Arrow | null {
    let startRect = this.getBoundingRect(pair[0]);
    let endRect = this.getBoundingRect(pair[1]);
    if (!startRect || !endRect) {
      console.error('Could not form arrow from', pair);
      return null;
    }
    return {
      x1: this.getCenter(startRect.right, startRect.left, pageXOffset),
      y1: this.getCenter(startRect.top, startRect.bottom, pageYOffset),
      x2: this.getCenter(endRect.right, endRect.left, pageXOffset),
      y2: this.getCenter(endRect.top, endRect.bottom, pageYOffset),
    };
  }

  public getBlockArrows(): Arrow[] {
    return this.blocks.map((block) => this.toArrow(block)).filter(arrow => arrow !== null);
  }


  public getCenter(a, b, offset): number {
    return (a + b + offset * 2) / 2;
  }

}
