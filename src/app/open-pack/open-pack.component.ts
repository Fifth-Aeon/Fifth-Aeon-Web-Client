import { Component, OnInit } from '@angular/core';
import { DecksService } from 'app/decks.service';
import { Collection } from 'app/game_model/collection';
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
  working: boolean;
  message: string;

  constructor(
    decks: DecksService,
    private collectionService: CollectionService
  ) {
    this.collection = collectionService.getCollection();
    this.defaultMessage();
  }

  defaultMessage() {
    this.message = `You have ${this.collection.getPackCount()} pack(s) and ${this.collection.getGold()} gold.`;
  }

  async open() {
    this.working = true;
    this.message = 'Communicating with server.';
    let result = await this.collectionService.openPack();
    if (typeof result === 'string')
      this.message = result;
    else {
      this.cards = result;
      this.defaultMessage();
    }
    this.working = false;
  }

  async buy() {
    this.working = true;
    this.message = 'Communicating with server.';
    let result = await this.collectionService.buyPack();
    if (result) {
      this.defaultMessage();
    } else {
      this.message = 'You can\'t afford a pack';
    }
    this.working = false;
  }

  done() {
  }

  ngOnInit() {
  }

}
