import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
import { CollectionService } from 'app/collection.service';
import { AuthenticationService } from 'app/user/authentication.service';
import { WebClient } from './client';
import { EditorDataService } from './editor/editor-data.service';
import { DeckList, SavedDeck } from './game_model/deckList';
import { standardFormat } from './game_model/gameFormat';
import { apiURL } from './url';

const saveURL = `${apiURL}/api/cards/storeDeck`;
const loadUrl = `${apiURL}/api/cards/getDecks`;
const deleteUrl = `${apiURL}/api/cards/deleteDeck`;

import { IDataProvider } from './data/data-provider';
import { SettingsService } from './settings/settings.service';
import { LocalDataProvider } from './data/local-data-provider';
import { ServerDataProvider } from './data/server-data-provider';

@Injectable()
export class DecksService {
    private decks: Array<DeckList> = [];
    private currentDeck: DeckList = new DeckList();
    private editingDeck: DeckList = new DeckList();
    private currentDeckNumber = 0;

    constructor(
        private client: WebClient,
        private collection: CollectionService,
        private auth: AuthenticationService,
        private http: HttpClient,
        private editorData: EditorDataService,
        private settings: SettingsService,
        private localData: LocalDataProvider,
        private serverData: ServerDataProvider
    ) {
        this.auth.onAuth(data => {
            if (data) {
                this.loadDecks();
            }
        });
        this.settings.isOffline$.subscribe(() => {
            this.loadDecks();
        });
    }

    private getDataProvider(): IDataProvider {
        return this.settings.isOffline() ? this.localData : this.serverData;
    }

    public saveDeck(deck: DeckList) {
        return this.getDataProvider()
            .saveDeck(deck.getSavable())
            .then((id: number) => (deck.id = id))
            .catch(console.error);
    }

    public getDecks() {
        return this.decks;
    }

    public loadDecks() {
        if (!this.auth.loggedIn() && !this.settings.isOffline()) {
            return;
        }
        return this.getDataProvider()
            .getDecks()
            .then(decks => {
                this.decks.length = 0;
                for (const deckData of decks) {
                    try {
                        const loaded = new DeckList(standardFormat, deckData);
                        this.decks.push(loaded);
                    } catch (e) { }
                }
            })
            .catch(console.error);
    }

    public setCurrentDeck(index: number) {
        this.currentDeck = this.decks[index];
        this.client.setDeck(this.currentDeck);
        this.client.onDeckSelected();
    }

    public editDeck(index: number) {
        this.editingDeck = this.decks[index];
        this.client.openDeckEditor();
    }

    public finishEditing() {
        this.editingDeck.genMetadata();
        this.saveDeck(this.editingDeck);
        this.client.openDeckSelector();
    }

    public deleteDeck(index: number) {
        const removed = this.decks.splice(index, 1)[0];
        this.currentDeckNumber = Math.min(
            this.currentDeckNumber,
            this.decks.length - 1
        );
        this.getDataProvider()
            .deleteDeck(removed.id)
            .catch(console.error);
    }

    public newDeck() {
        const newDeck = new DeckList(standardFormat);
        newDeck.generateRandomNColorDeck(1, this.collection.getCollection());
        this.decks.unshift(newDeck);
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
