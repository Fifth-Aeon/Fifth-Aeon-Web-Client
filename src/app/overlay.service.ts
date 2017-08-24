import { Injectable, ElementRef } from '@angular/core';
import { remove } from 'lodash';

import { Unit } from 'app/game_model/unit';
import { Card } from 'app/game_model/card';
import { Game } from 'app/game_model/game';


type Arrow = { x1: number, y1: number, x2: number, y2: number }

@Injectable()
export class OverlayService {
  public card: Card = null;
  private cardsElements: Map<string, ElementRef> = new Map();
  private blocks: Array<[string, string]> = [];
  public targets: Array<Arrow> = [];

  constructor() { }

  public registerCard(id: string, element: ElementRef) {
    this.cardsElements.set(id, element);
  }

  public addBlocker(id: string, target: string) {
    this.blocks.push([id, target]);
  }

  public removeBlocker(toRemove: string) {
    remove(this.blocks, (block) => block[0] == toRemove);
  }

  public clearBlockers() {
    this.blocks = [];
  }

  public addSpell(spell: Card, targets: Array<Unit>) {
    this.card = spell;
    setTimeout(() => {
      this.targets = targets
        .map(target => [spell.getId(), target.getId()] as [string, string])
        .map((target) => this.toArrow(target))
        .filter(arrow => arrow != null);
      setTimeout(() => {
        this.targets = [];
      }, 1500);
      setTimeout(() => {
        this.card = null;        
      }, 3000);
    }, 50);

  }

  public onPlay(card: Card, game: Game, player: number) {
    if (card.isUnit())
      return;
    this.addSpell(card, card.getTargeter().getTargets(card, game));
  }

  private toArrow(blockerIds: [string, string]): Arrow {
    let blocker = this.cardsElements.get(blockerIds[0]);
    let blocked = this.cardsElements.get(blockerIds[1]);
    if (!blocker || !blocked) {
      console.log(blockerIds, blocker, blocked);
      return null;
    }
    var blockerRect = blocker.nativeElement.getElementsByClassName("card-image")[0].getBoundingClientRect();
    var blockedRect = blocked.nativeElement.getElementsByClassName("card-image")[0].getBoundingClientRect();
    return {
      x1: this.getCenter(blockerRect.right, blockerRect.left, pageXOffset + 12.5),
      y1: this.getCenter(blockerRect.top, blockerRect.bottom, pageYOffset),
      x2: this.getCenter(blockedRect.right, blockedRect.left, pageXOffset + 12.5),
      y2: this.getCenter(blockedRect.top, blockedRect.bottom, pageYOffset),
    }
  }

  public getBlockArrows(): Arrow[] {
    return this.blocks.map((block) => this.toArrow(block)).filter(arrow => arrow != null);
  }


  public getCenter(a, b, offset): number {
    return (a + b + offset * 2) / 2;
  }

}
