import { Component, OnInit, ElementRef } from '@angular/core';
import {sortBy} from 'lodash';

import { WebClient } from '../client';
import { GameFormat } from '../game_model/gameFormat';
import { DeckList } from '../game_model/deckList';
import { allCards } from '../game_model/cards/allCards';
import { Card } from '../game_model/card';



@Component({
  selector: 'bsc-deck-editor',
  templateUrl: './deck-editor.component.html',
  styleUrls: ['./deck-editor.component.scss']
})
export class DeckEditorComponent implements OnInit {
  private cards: Array<Card>;
  public allCards = allCards;
  public pageCards: Array<Card>;
  public pageNumber: number = 0;
  private pageSize: number = 10;
  public deck: DeckList;
  public format = new GameFormat();

  constructor(private client: WebClient) {
    this.cards = Array.from(allCards.values()).map(factory => factory())
    this.cards = sortBy(this.cards, (card:Card) => card.getCost().getColor() * 100 + card.getCost().getNumeric());
    this.setPage();
    this.deck = this.client.getDeck();;
  }

  public onResize(rect: ClientRect) {
    let width = rect.right - rect.left;
    this.pageSize = Math.floor(width / 175) * 2;
    this.setPage();
  }

  public done() {
    this.client.setDeck(this.deck);
    this.client.returnToLobby();
  }

  public add(card: Card) {
    this.deck.addCard(card);
  }

  public canNext() {
    return this.pageNumber + 1 < this.cards.length / this.pageSize;
  }

  public next() {
    this.pageNumber++;
    this.setPage();
  }

  public canPrev() {
    return this.pageNumber != 0;
  }

  public prev() {
    this.pageNumber--;
    this.setPage();
  }

  private setPage() {
    this.pageCards = this.cards.slice(this.pageNumber * this.pageSize, this.pageNumber * this.pageSize + this.pageSize);
  }

  ngOnInit() {
    this.onResize(document.getElementById('editor-cards').getBoundingClientRect())
  }

}
