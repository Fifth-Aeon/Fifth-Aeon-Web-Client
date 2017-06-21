import { Component, OnInit, Input } from '@angular/core';

import { Card } from '../game_model/card';

@Component({
  selector: 'bsc-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() card: Card;

  constructor() { }

  ngOnInit() {
  }

}
