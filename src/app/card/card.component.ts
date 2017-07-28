import { Component, OnInit, Input } from '@angular/core';
import { Card } from '../game_model/card';
import { UnitType } from '../game_model/unit';

enum GlowType {
  None, Select, Attack, Defense
}

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

  getType(type: UnitType) {
    return UnitType[type];
  }

  constructor() { }


  public getImage() {
    return 'assets/' + this.card.getImage();
  }
  public glowType() {
    if (this.selected)
      return GlowType.Select;
    if (this.card.isAttacking())
      return GlowType.Attack;
    if (this.card.isBlocking())
      return GlowType.Defense;
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
  }

}
