import { Injectable, ElementRef } from '@angular/core';
import { remove } from 'lodash';

type Arrow = { x1: number, y1: number, x2: number, y2: number }

@Injectable()
export class OverlayService {
  private cardsElements: Map<string, ElementRef> = new Map();
  private blocks: Array<[string, string]> = [];
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

  public getBlockArrows(): Arrow[] {
    return this.blocks.map(blockerIds => {
      let blocker = this.cardsElements.get(blockerIds[0]);
      let blocked = this.cardsElements.get(blockerIds[1]);
      var blockerRect = blocker.nativeElement.getElementsByClassName("card-image")[0].getBoundingClientRect();
      var blockedRect = blocked.nativeElement.getElementsByClassName("card-image")[0].getBoundingClientRect();
      return {
        x1: this.getCenter(blockerRect.right, blockerRect.left, pageXOffset + 12.5),
        y1: this.getCenter(blockerRect.top, blockerRect.bottom, pageYOffset),
        x2: this.getCenter(blockedRect.right, blockedRect.left, pageXOffset + 12.5),
        y2: this.getCenter(blockedRect.top, blockedRect.bottom, pageYOffset),
      }
    })
  }

  getCenter(a, b, offset): number {
    return (a + b + offset * 2) / 2;
  }

}
