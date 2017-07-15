import { Component, OnInit, Input } from '@angular/core';

import { Card } from '../game_model/card';

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

  constructor() { }

  public x() {
    return (this.hovered ? 1.1 : 1) * 100 * this.scale;
  }

  public y() {
    return (this.hovered ? 1.1 : 1) * 140 * this.scale;
  }

  ngOnInit() {
    if (!this.scale)
      this.scale = 1.25;
  }

}
