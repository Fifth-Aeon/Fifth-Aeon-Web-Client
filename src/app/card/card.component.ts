import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Card } from '../game_model/card';
import { UnitType } from '../game_model/unit';

import { OverlayService } from '../overlay.service';

enum GlowType {
  None, Select, Attack, Defense, Targeted
}

const keywordsDefs = new Map<string, string>();
keywordsDefs.set('Flying', 'Can only be blocked by units with flying.')
keywordsDefs.set('Poisoned', 'This unit gets -1/-1 at the start of its owners turn.')
keywordsDefs.set('Poison', 'Causes a unit to become poisoned. Poisoned units get -1/-1 at the start of their owners turn.')
keywordsDefs.set('Venomous', 'Poisons any unit it damages. Poisoned units get -1/-1 at the start of their owners turn.')
keywordsDefs.set('Affinity', 'Triggers the first time you play a unit of the same type.')
keywordsDefs.set('Serenity', 'Triggers at the end of your turn if you did not attack that turn.')

const keywords = Array.from(keywordsDefs.keys());
const keywordRegex = new RegExp(keywords.join('|'), 'gi');

@Component({
  selector: 'ccg-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() card: Card;
  @Input() scale: number;
  sizeY: number;
  sizeX: number;
  padding = 30;
  hovered: boolean = false;
  @Input() darkened: boolean = false;
  @Input() selected: boolean = false;
  @Input() target: boolean = false;

  constructor(private overlay: OverlayService, private element: ElementRef) {
  }

  getType(type: UnitType) {
    return UnitType[type];
  }



  public htmlText(text: string) {
    return text.replace(keywordRegex, '<b>$&</b>');
  }

  public getKeywords() {
    return Array.from(new Set(this.card.getText().match(keywordRegex)));
  }

  public keywords() {
    return this.getKeywords().map(key => key + ' - ' + keywordsDefs.get(key)).join(' \n\n ');
  }

  public tooltipClass = {
    multiline: true
  }



  public getFontSize() {
    let size = 16;
    let length = this.card.getText().length;

    size -= Math.floor(length / 30);

    if (this.hovered)
      size += 2;

    return size + 'px';
  }

  public getImage() {
    return 'assets/png/' + this.card.getImage();
  }

  public glowType() {
    if (this.selected)
      return GlowType.Select;
    if (this.card.isAttacking())
      return GlowType.Attack;
    if (this.card.isBlocking())
      return GlowType.Defense;
    if (this.target)
      return GlowType.Targeted;
    return GlowType.None;
  }

  public x() {
    return (this.hovered ? 1.15 : 1) * 100 * this.scale;
  }

  public y() {
    return (this.hovered ? 1.15 : 1) * 140 * this.scale;
  }

  ngOnInit() {
    if (!this.scale)
      this.scale = 1.25;
    this.overlay.registerCard(this.card.getId(), this.element);

  }

}
