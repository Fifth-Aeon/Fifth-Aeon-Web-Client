import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
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

import { IDataProvider } from './data/data-provider';
import { SettingsService } from './settings/settings.service';
import { LocalDataProvider } from './data/local-data-provider';
import { ServerDataProvider } from './data/server-data-provider';

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
        private dialog: MatDialog,
        private settings: SettingsService,
        private localData: LocalDataProvider,
        private serverData: ServerDataProvider
    ) {
        auth.onAuth(data => {
            if (data) {
                this.load();
            }
        });
        this.settings.isOffline$.subscribe(() => {
            this.load();
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

    private getDataProvider(): IDataProvider {
        return this.settings.isOffline() ? this.localData : this.serverData;
    }

    private checkDaily() {
        if (this.settings.isOffline()) {
            return;
        }
        lastValueFrom(this.http
            .get<DailyRewardData>(dailyURL, {
                headers: this.auth.getAuthHeader()
            }))
            .then(res => {
                if (!res.daily) {
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
        this.save();
    }

    public save() {
        return this.getDataProvider().saveCollection(this.collection.getSavable());
    }

    public load() {
        if (!this.auth.loggedIn() && !this.settings.isOffline()) {
            return Promise.resolve();
        }
        return this.getDataProvider().getCollection()
            .then(res => {
                this.collection.fromSavable(res);
                this.checkDaily();
            });
    }

    public async openPack() {
        if (this.settings.isOffline()) {
            const cards = this.collection.openBooster();
            if (cards) {
                await this.save();
                return cards.map(id => cardList.getCard(id));
            }
            return 'No packs to open';
        }

        return lastValueFrom(this.http
            .post<string[]>(
                openPackURL,
                { item: 'pack' },
                { headers: this.auth.getAuthHeader() }
            ))
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
        if (this.settings.isOffline()) {
            if (this.collection.getGold() >= 100) {
                this.collection.buyPack();
                this.save();
                return Promise.resolve(true);
            }
            return Promise.resolve(false);
        }

        return lastValueFrom(this.http
            .post(
                buyPackURL,
                { item: 'pack' },
                { headers: this.auth.getAuthHeader() }
            ))
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

        if (this.settings.isOffline()) {
            const reward = this.collection.addWinReward(won);
            await this.save();
            return CollectionService.describeReward(reward);
        }

        let reward: Rewards;
        try {
            reward = await lastValueFrom(this.http
                .post<Rewards>(
                    `${apiURL}/api/cards/reward`,
                    { won: won },
                    { headers: this.auth.getAuthHeader() }
                ));
        } catch (e) {
            console.error(e);
            return 'Error loading rewards.';
        }

        this.collection.addReward(reward);
        return CollectionService.describeReward(reward);
    }
}
