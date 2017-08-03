import { Component, OnInit, Input } from '@angular/core';
import { Card } from '../game_model/card';
import { UnitType } from '../game_model/unit';

enum GlowType {
  None, Select, Attack, Defense, Targeted
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
  @Input() target: boolean = false;

  getType(type: UnitType) {
    return UnitType[type];
  }

  constructor() { }

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
  }

}
