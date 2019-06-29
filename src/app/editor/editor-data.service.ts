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
    private static saveSetRoute = `${apiURL}/api/modding/insertOrUpdateSet`;
    private static getUserSetsRoute = `${apiURL}/api/modding/userSets`;
    private static getSpecificSetRoute = `${apiURL}/api/modding/publicSet/`;
    private static getPublicSetsRoute = `${apiURL}/api/modding/publicSets`;
    private static addCardToSetRoute = `${apiURL}/api/modding/addCardToSet`;
    private static removeCardFromSetRoute = `${apiURL}/api/modding/removeCardFromSet`;
    private static deleteSetRoute = `${apiURL}/api/modding/deleteSet`;
    private static getCardMemberships = `${apiURL}/api/modding/getUserSetMemberships`;
    private static getActiveSets = `${apiURL}/api/modding/getActiveSets`;
    private static activateSet = `${apiURL}/api/modding/activateSet`;
    private static deactivateSet = `${apiURL}/api/modding/deactivateSet`;

    private cards: Array<CardData> = [];
    private activeSets?: Set<string>;
    private lastSavedCardVersion = new Map<string, CardData>();
    private sets: Array<SetInformation> = [];
    private lastSavedSetVersion = new Map<string, SetInformation>();
    private cardsInSet = new Map<string, Set<string>>();
    private setCache = new Map<string, CardSet>();

    constructor(
        private collectionService: CollectionService,
        private auth: AuthenticationService,
        private http: HttpClient
    ) {
        this.auth.onAuth(user => {
            if (user !== null) {
                this.loadData();
            }
        });
        setInterval(() => this.saveData(), 10000);
    }

    private loadActiveSets() {
        return this.http
            .get<CardSet[]>(EditorDataService.getActiveSets, {
                headers: this.auth.getAuthHeader()
            })
            .toPromise();
    }

    public setSetActive(setId: string, active: boolean) {
        if (active) {
            this.getSet(setId).then(set => this.activateSet(set));
        } else {
            this.getSet(setId).then(set => this.deactivateSet(set));
        }
        this.http
            .post(
                active
                    ? EditorDataService.activateSet
                    : EditorDataService.deactivateSet,
                { setId: setId },
                {
                    headers: this.auth.getAuthHeader()
                }
            )
            .toPromise()
            .catch(err => console.warn(err));
    }

    public addCardToSet(setId: string, id: string) {
        this.http
            .post(
                EditorDataService.addCardToSetRoute,
                { cardId: id, setId: setId },
                {
                    headers: this.auth.getAuthHeader()
                }
            )
            .toPromise()
            .catch(err => console.warn(err));
    }

    public removeCardFromSet(setId: string, id: string) {
        this.http
            .post(
                EditorDataService.removeCardFromSetRoute,
                { cardId: id, setId: setId },
                {
                    headers: this.auth.getAuthHeader()
                }
            )
            .toPromise()
            .catch(err => console.warn(err));
    }

    public deleteSet(set: SetInformation) {
        this.sets = this.sets.filter(curr => curr.id !== set.id);
        this.http
            .post(
                EditorDataService.deleteSetRoute,
                { setId: set.id },
                {
                    headers: this.auth.getAuthHeader()
                }
            )
            .toPromise()
            .then(() => console.log('Set deleted'));
    }

    public getCardsInSet(setId: string): Set<string> {
        return this.cardsInSet.get(setId) || new Set();
    }

    public createSet() {
        const id: string = uuid.v4();

        this.sets.push({
            name: 'New Set',
            description: '',
            id: id,
            public: false
        });
    }

    public saveSet(set: SetInformation) {
        this.http
            .post(
                EditorDataService.saveSetRoute,
                { setInfo: set },
                {
                    headers: this.auth.getAuthHeader()
                }
            )
            .toPromise()
            .then(() => this.markSetSaved(set))
            .catch(err => console.warn('Failed to save set', err));
    }

    private saveCard(card: CardData) {
        return this.http
            .post(
                EditorDataService.saveCardRoute,
                { cardData: card },
                {
                    headers: this.auth.getAuthHeader()
                }
            )
            .toPromise()
            .then(() => this.markCardSaved(card))
            .catch(err => console.warn('Failed to save card', err));
    }

    private markCardSaved(card: CardData) {
        this.lastSavedCardVersion.set(card.id, cloneDeep(card));
    }

    private markSetSaved(set: SetInformation) {
        this.lastSavedSetVersion.set(set.id, cloneDeep(set));
    }

    public getPublicSets(): Promise<SetInformation[]> {
        return this.http
            .get<SetInformation[]>(EditorDataService.getPublicSetsRoute)
            .toPromise();
    }

    public getSet(setInfo: SetInformation | string): Promise<CardSet> {
        const id = typeof setInfo === 'string' ? setInfo : setInfo.id;
        const cached = this.setCache.get(id);
        if (cached) {
            return Promise.resolve(cached);
        }
        return this.http
            .get<CardSet>(EditorDataService.getSpecificSetRoute + id)
            .toPromise()
            .then(set => {
                this.setCache.set(id, set);
                return set;
            });
    }

    public getSets() {
        return this.sets;
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
            const lastSaved = this.lastSavedCardVersion.get(card.id);
            if (!lastSaved || !isEqual(card, lastSaved)) {
                this.saveCard(card);
            }
        }
        for (const set of this.sets) {
            const lastSaved = this.lastSavedSetVersion.get(set.id);
            if (!lastSaved || !isEqual(set, lastSaved)) {
                this.saveSet(set);
            }
        }
        this.addToCollection();
    }

    private loadData() {
        this.migrateCardsFromLocalStorage();
        this.loadCards();
        this.loadSets();
        this.loadCardsInSet();
        this.activateSets();
    }

    public getActiveSets(): Promise<Set<string>> {
        if (this.activeSets) {
            return Promise.resolve(this.activeSets);
        }
        return new Promise(resolve => {
            this.onActiveSetsLoaded = activeSets => resolve(activeSets);
        });
    }

    private onActiveSetsLoaded: (activeSets: Set<string>) => void = () => null;
    private activateSets() {
        this.loadActiveSets().then(activeSets => {
            this.activeSets = new Set();
            for (const set of activeSets) {
                this.activateSet(set);
            }
            this.onActiveSetsLoaded(this.activeSets);
        });
    }

    private activateSet(set: CardSet) {
        if (this.activeSets) {
            this.activeSets.add(set.id);
        }
        for (const card of set.cards) {
            cardList.addFactory(cardList.buildCardFactory(card));
            this.collectionService.getCollection().addCardPlayset(card.id);
        }
    }

    private deactivateSet(set: CardSet) {
        if (this.activeSets) {
            this.activeSets.delete(set.id);
        }
        for (const card of set.cards) {
            this.collectionService.getCollection().removeCardPlayset(card.id);
        }
    }

    private loadCardsInSet() {
        this.http
            .get<{ setId: string; cardId: string }[]>(
                EditorDataService.getCardMemberships,
                {
                    headers: this.auth.getAuthHeader()
                }
            )
            .toPromise()
            .then(memberships => {
                for (const membership of memberships) {
                    const set =
                        this.cardsInSet.get(membership.setId) || new Set();
                    set.add(membership.cardId);
                    this.cardsInSet.set(membership.setId, set);
                }
            });
    }

    private loadCards() {
        this.http
            .get<CardData[]>(EditorDataService.getCardsRoute, {
                headers: this.auth.getAuthHeader()
            })
            .toPromise()
            .then(cards => {
                this.cards = cards;
                for (const card of cards) {
                    this.markCardSaved(card);
                }
                this.addToCollection();
            });
    }

    private migrateCardsFromLocalStorage() {
        const jsonStr = localStorage.getItem(EditorDataService.localStorageKey);
        if (!jsonStr) {
            return;
        }
        const cards = JSON.parse(jsonStr).cards as CardData[];
        Promise.all(cards.map(card => this.saveCard(card))).then(() => {
            localStorage.setItem(EditorDataService.localStorageKey, '{cards: []}');
        });
    }

    private loadSets() {
        this.http
            .get<SetInformation[]>(EditorDataService.getUserSetsRoute, {
                headers: this.auth.getAuthHeader()
            })
            .toPromise()
            .then(sets => {
                this.sets = sets;
                for (const set of sets) {
                    this.markSetSaved(set);
                }
            });
    }

    private addToCollection() {
        for (const card of this.cards) {
            cardList.addFactory(cardList.buildCardFactory(card));
            this.collectionService.getCollection().addCardPlayset(card.id);
        }
    }
}
