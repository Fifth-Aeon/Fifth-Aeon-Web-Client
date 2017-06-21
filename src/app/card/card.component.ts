import { Component, OnInit, Input } from '@angular/core';

import { Card } from '../game_model/card';

@Component({
  selector: 'ccg-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() card: Card;

  constructor() { }

  ngOnInit() {
  }

}
