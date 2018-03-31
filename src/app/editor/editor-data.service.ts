import { Injectable } from '@angular/core';
import { cardList, CardData } from 'fifthaeon/cards/cardList';
import * as uuid from 'uuid';
import { CardType } from 'fifthaeon/card';
import { UnitType } from 'fifthaeon/unit';

@Injectable()
export class EditorDataService {
  private static localStorageKey = 'ccg-cards';

  private cards: Array<CardData> = [];

  constructor() {
    this.loadData();
  }

  public createCard(name: string) {
    const id: string = uuid.v4();
    const data = {
      name: name,
      id: id,
      imageUrl: 'person.png',
      cost: {
        energy: 0,
        synthesis: 0,
        growth: 0,
        decay: 0,
        renewal: 0
      },
      mechanics: [],
      targeter: { id: 'Untargeted', optional: false },
      hostTargeter: { id: 'FriendlyUnit', optional: false  },
      cardType: CardType.Unit,
      life: 1,
      damage: 1,
      type: UnitType.Human
    } as CardData;
    this.cards.push(data);
  }

  public getCard(id: string) {
    return this.cards.find(card => card.id === id);
  }

  public getCards() {
    return this.cards;
  }

  public saveData() {
    localStorage.setItem(EditorDataService.localStorageKey, JSON.stringify({ cards: this.cards }));
  }

  private loadData() {
    const jsonStr = localStorage.getItem(EditorDataService.localStorageKey);
    if (!jsonStr) return;
    const data = JSON.parse(jsonStr);
    this.cards = data.cards;
  }

}
