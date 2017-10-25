import { Injectable } from '@angular/core';
import { shuffle } from 'lodash';

import { WebClient } from './client';
import { DeckList } from './game_model/deckList';
import { standardFormat } from './game_model/gameFormat';
import { ResourceTypeGroup, ResourceTypeNames } from './game_model/resource';

import { deckLists } from './game_model/scenarios/decks';
const deckStore = 'deck-store';

@Injectable()
export class DecksService {
  private decks: Array<DeckList> = [];
  private currentDeck: DeckList;
  private editingDeck: DeckList;
  private currentDeckNumber: number = 0;

  constructor(private client: WebClient) {
    if (this.load())
      return;
    this.decks = [];
    for (let deck of deckLists) {
      this.decks.push(deck.clone());
    }
    this.decks = shuffle(this.decks);
    this.currentDeck = this.decks[this.currentDeckNumber];
  }

  public load() {
    try {
      let data = JSON.parse(localStorage.getItem(deckStore));
      this.decks = data.decks.map(deckData => {
        let deck = new DeckList(standardFormat);
        deck.fromJson(deckData);
        return deck;
      });
      this.currentDeckNumber = data.currentDeckNumber;
      this.currentDeck = this.decks[this.currentDeckNumber];
      return true;
    } catch (e) {
      return false;
    }
  }

  public save() {
    localStorage.setItem(deckStore, JSON.stringify({
      decks: this.decks.map(deck => deck.toJson()),
      setCurrentDeck: this.currentDeckNumber
    }));
  }

  public getDecks() {
    return this.decks;
  }

  public setCurrentDeck(index: number) {
    this.currentDeck = this.decks[index];
    this.client.setDeck(this.currentDeck);
    this.save();
    this.client.onDeckSelected();
  }

  public editDeck(index: number) {
    this.editingDeck = this.decks[index];
    this.client.openDeckEditor();
  }

  public finishEditing() {
    this.editingDeck.genMetadata();
    this.save();
    this.client.openDeckSelector();
  }

  public deleteDeck(index: number) {
    this.decks.splice(index, 1);
    this.currentDeckNumber = Math.min(this.currentDeckNumber, this.decks.length - 1);
    this.save();
  }

  public newDeck() {
    this.decks.unshift(new DeckList(standardFormat));
    this.save()
  }

  public cancelSelect() {
    this.client.returnToLobby();
  }

  public getCurrentDeck() {
    return this.currentDeck;
  }

  public getEditDeck() {
    return this.editingDeck;
  }
}
