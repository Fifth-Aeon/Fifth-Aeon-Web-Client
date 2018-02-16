import { Injectable } from '@angular/core';
import { Collection, SavedCollection } from 'app/game_model/collection';
import { AuthenticationService } from 'app/user/authentication.service';
import { HttpClient } from '@angular/common/http';
import { apiURL } from './url';
import { cardList } from 'app/game_model/cards/allCards';

const saveURL = `${apiURL}/api/cards/storeCollection`;
const loadUrl = `${apiURL}/api/cards/getCollection`;

@Injectable()
export class CollectionService {
  private collection = new Collection();

  constructor(
    private auth: AuthenticationService,
    private http: HttpClient
  ) {
    auth.onAuth(() => {
      this.load();
    });

  }

  public unlockAll() {
    for (let card of cardList) {
      let diff = 4 - this.collection.getCardCount(card);
      this.collection.addCard(card, Math.max(diff, 0));
    }
  }

  public save() {
    return this.http.post(saveURL,
      { collection: this.collection.getSavable() },
      { headers: this.auth.getAuthHeader() })
      .toPromise();
  }

  public load() {
    return this.http.get(loadUrl, { headers: this.auth.getAuthHeader() })
      .toPromise()
      .then((res: SavedCollection) => {
        this.collection.fromSavable(res);
        console.log('loaded', this.collection, 'from', res);
      });
  }

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
      msg += ` and a card pack`;
    else if (reward.packs > 1)
      msg += ` and ${reward.packs} card packs`;

    return msg + '.';
  }


}
