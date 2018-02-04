import { Injectable } from '@angular/core';
import { Collection } from 'app/game_model/collection';

@Injectable()
export class CollectionService {
  private collection = new Collection();

  constructor() { }

  public getCollection() {
    return this.collection;
  }

  public onGameEnd(winner: number, quit: boolean) {
    if (!winner && quit) {
      return '';
    }
    let reward = this.collection.addWinReward(true);
    let msg = `You earned ${reward.gold} gold`;

    if (reward.packs === 1)
      msg += ` and a card pack`
    else if (reward.packs > 1)
      msg += ` and ${reward.packs} card packs`

    return msg + '.';
  }


}
