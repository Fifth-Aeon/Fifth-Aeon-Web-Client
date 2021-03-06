import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { cardList } from 'app/game_model/cards/cardList';
import {
    Collection,
    Rewards,
    SavedCollection
} from 'app/game_model/collection';
import { AuthenticationService } from 'app/user/authentication.service';
import { DailyDialogComponent } from './daily-dialog/daily-dialog.component';
import { apiURL } from './url';
import { ResourceTypeNames } from './game_model/resource';
import { Unit } from './game_model/card-types/unit';
import { Item } from './game_model/card-types/item';
import { Enchantment } from './game_model/card-types/enchantment';
import { CardType } from './game_model/cardType';

const saveURL = `${apiURL}/api/cards/storeCollection`;
const loadUrl = `${apiURL}/api/cards/getCollection`;
const buyPackURL = `${apiURL}/api/cards/buy`;
const openPackURL = `${apiURL}/api/cards/openPack`;
const dailyURL = `${apiURL}/api/cards/checkDaily`;

interface DailyRewardData {
    daily: boolean;
    cards: string[];
    nextRewardTime: number;
}

@Injectable()
export class CollectionService {
    private collection = new Collection();

    static describeReward(reward: Rewards): string {
        let msg = `You earned ${reward.gold} gold`;
        if (reward.packs === 1) {
            msg += ` and a card pack`;
        } else if (reward.packs > 1) {
            msg += ` and ${reward.packs} card packs`;
        }
        return msg + '.';
    }

    constructor(
        private auth: AuthenticationService,
        private http: HttpClient,
        private dialog: MatDialog
    ) {
        auth.onAuth(data => {
            if (data) {
                this.load();
            }
        });
        (window as any).getCardSheet = () => {
            const cards = cardList
                .getCards()
                .sort((a, b) => (a.getName() > b.getName() ? 1 : -1));
            let output = `Name\tType\tEnergy Cost\t${ResourceTypeNames.join(
                '\t'
            )}\tDamage/Empower\tLife/Power\tText\n`;

            for (const card of cards) {
                output += card.getName() + '\t';
                output += CardType[card.getCardType()] + '\t';
                output += card.getCost().getNumeric() + '\t';
                for (const resourceName of ResourceTypeNames) {
                    output += card.getCost().getOfType(resourceName) + '\t';
                }
                if (card instanceof Unit) {
                    output += card.getDamage() + '\t';
                    output += card.getLife();
                } else if (card instanceof Item) {
                    output += card.getDamage() + '\t';
                    output += card.getLife();
                } else if (card instanceof Enchantment) {
                    output += card.getModifyCost().getNumeric() + '\t';
                    output += card.getPower();
                }
                output += card.getText() + '\n';
            }
            return output;
        };
    }

    private checkDaily() {
        this.http
            .get<DailyRewardData>(dailyURL, {
                headers: this.auth.getAuthHeader()
            })
            .toPromise()
            .then(res => {
                if (!res.daily) {
                    // const wait = res.nextRewardTime / 1000 / 60 / 60;
                    // dialogRef.componentInstance.nextRewardTime = wait;
                    return;
                } else {
                    const dialogRef = this.dialog.open(DailyDialogComponent);

                    dialogRef.componentInstance.rewards = res.cards.map(id =>
                        cardList.getCard(id)
                    );
                }
            });
    }

    public unlockAll() {
        for (const card of cardList.getCards()) {
            const diff = 4 - this.collection.getCardCount(card);
            this.collection.addCard(card, Math.max(diff, 0));
        }
    }

    public save() {
        return this.http
            .post(
                saveURL,
                { collection: this.collection.getSavable() },
                { headers: this.auth.getAuthHeader() }
            )
            .toPromise();
    }

    public load() {
        return this.http
            .get<SavedCollection>(loadUrl, {
                headers: this.auth.getAuthHeader()
            })
            .toPromise()
            .then(res => {
                this.collection.fromSavable(res);
                this.checkDaily();
            });
    }

    public async openPack() {
        return this.http
            .post<string[]>(
                openPackURL,
                { item: 'pack' },
                { headers: this.auth.getAuthHeader() }
            )
            .toPromise()
            .then(ids => {
                this.collection.removePack();
                return ids.map(id => {
                    const card = cardList.getCard(id);
                    this.collection.addCard(card);
                    return card;
                });
            })
            .catch(errData => {
                if (errData.error) {
                    this.collection.removePack();
                }
                return errData.error ? errData.error.message : errData.message;
            });
    }

    public buyPack() {
        return this.http
            .post(
                buyPackURL,
                { item: 'pack' },
                { headers: this.auth.getAuthHeader() }
            )
            .toPromise()
            .then(() => {
                this.collection.buyPack();
                return true;
            })
            .catch(err => {
                return false;
            });
    }

    public getCollection() {
        return this.collection;
    }

    public async onGameEnd(won: boolean, quit: boolean) {
        if (!won && quit) {
            return '';
        }
        let reward: Rewards;
        try {
            reward = await this.http
                .post<Rewards>(
                    `${apiURL}/api/cards/reward`,
                    { won: won },
                    { headers: this.auth.getAuthHeader() }
                )
                .toPromise();
        } catch (e) {
            console.error(e);
            return 'Error loading rewards.';
        }

        this.collection.addReward(reward);
        return CollectionService.describeReward(reward);
    }
}
