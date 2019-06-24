import { Injectable } from '@angular/core';
import { cardList, CardData } from '../game_model/cards/cardList';
import * as uuid from 'uuid';
import { CardType } from '../game_model/card-types/card';
import { UnitType } from '../game_model/card-types/unit';
import { CollectionService } from '../collection.service';
import { AuthenticationService } from 'app/user/authentication.service';
import { HttpClient } from '@angular/common/http';
import { apiURL } from 'app/url';
import { CardSet, SetInformation } from 'app/game_model/cardSet';
import { cloneDeep, isEqual } from 'lodash';

@Injectable()
export class EditorDataService {
    private static localStorageKey = 'ccg-cards';
    private static getCardsRoute = `${apiURL}/api/modding/getUserCards`;
    private static saveCardRoute = `${apiURL}/api/modding/insertOrUpdateCard`;
    private static createSetRoute = `${apiURL}/api/modding/createSet`;
    private static modifySetPublicityRoute = `${apiURL}/api/modding/modifySetPublicity`;
    private static getSpecificSetRoute = `${apiURL}/api/modding/publicSet/`;
    private static getPublicSetsRoute = `${apiURL}/api/modding/publicSets`;
    private static addCardToSetRoute = `${apiURL}/api/modding/addCardToSet`;

    private cards: Array<CardData> = [];
    private lastSavedVersion = new Map<string, CardData>();

    constructor(
        private collectionService: CollectionService,
        private auth: AuthenticationService,
        private http: HttpClient
    ) {
        this.auth.onAuth((user) => {
            if (user !== null) {
                this.loadData();
            }
        });
        setInterval(() => this.saveData(), 10000);
    }

    private saveCard(card: CardData) {
        this.http
            .post(EditorDataService.saveCardRoute, {cardData: card}, {
                headers: this.auth.getAuthHeader()
            })
            .toPromise()
            .then(() => this.markCardSaved(card))
            .catch(err => console.warn('Failed to save card', err));
    }

    private markCardSaved(card: CardData) {
        this.lastSavedVersion.set(card.id, cloneDeep(card));
    }

    public getPublicSets(): Promise<SetInformation[]> {
        return this.http
            .get<SetInformation[]>(EditorDataService.getPublicSetsRoute)
            .toPromise();
    }

    public getSet(setInfo: SetInformation): Promise<CardSet> {
        return this.http
            .get<CardSet>(EditorDataService.getSpecificSetRoute + setInfo.id)
            .toPromise();
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
            hostTargeter: { id: 'FriendlyUnit', optional: false },
            cardType: CardType.Unit,
            life: 1,
            damage: 1,
            power: 1,
            empowerCost: 1,
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
        if (!this.auth.loggedIn()) {
            return;
        }
        for (const card of this.cards) {
            const lastSaved = this.lastSavedVersion.get(card.id);
            if (!lastSaved || !isEqual(card, lastSaved)) {
                this.saveCard(card);
            }
        }
        this.addToCollection();
    }

    private loadData() {
        this.http
            .get<CardData[]>(EditorDataService.getCardsRoute, {
                headers: this.auth.getAuthHeader()
            })
            .toPromise()
            .then(cards => {
                console.log(cards);
                this.cards = cards;
                for (const card of cards) {
                    this.markCardSaved(card);
                }
            });
        const jsonStr = localStorage.getItem(EditorDataService.localStorageKey);
        if (!jsonStr) {
            return;
        }
        const data = JSON.parse(jsonStr);
        this.cards = data.cards;
        this.addToCollection();
    }

    private addToCollection() {
        for (const card of this.cards) {
            cardList.addFactory(cardList.buildCardFactory(card));
            this.collectionService.getCollection().addCardPlayset(card.id);
        }
    }
}
