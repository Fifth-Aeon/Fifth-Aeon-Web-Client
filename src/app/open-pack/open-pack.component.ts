import { Component, OnInit } from '@angular/core';
import { DecksService } from 'app/decks.service';
import { Collection } from 'app/game_model/collection';
import { allCards } from 'app/game_model/cards/allCards';
import { Card } from 'app/game_model/card';
import { CollectionService } from 'app/collection.service';


@Component({
  selector: 'ccg-open-pack',
  templateUrl: './open-pack.component.html',
  styleUrls: ['./open-pack.component.scss']
})
export class OpenPackComponent implements OnInit {
  collection: Collection;
  cards: Card[];

  constructor(
    decks: DecksService,
    collectionService: CollectionService
  ) {
    this.collection = collectionService.getCollection();
  }

  open() {
    this.cards = this.collection.openBooster().map(id => allCards.get(id)());
  }

  buy() {
    this.collection.buyPack();
  }

  ngOnInit() {
  }

}
