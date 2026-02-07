import { IDataProvider } from './data-provider';
import { SavedDeck } from '../game_model/deckList';
import { Collection, SavedCollection } from '../game_model/collection';
import { getStarterDecks } from '../game_model/scenarios/decks';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

import { Injectable } from '@angular/core';

interface CCGDB extends DBSchema {
    decks: {
        key: number;
        value: SavedDeck;
    };
    collection: {
        key: string;
        value: SavedCollection;
    };
}

@Injectable()
export class LocalDataProvider implements IDataProvider {
    private dbPromise: Promise<IDBPDatabase<CCGDB>>;

    constructor() {
        this.dbPromise = openDB<CCGDB>('ccg-data', 1, {
            upgrade(db) {
                db.createObjectStore('decks', { keyPath: 'id' });
                db.createObjectStore('collection');
            },
        });
    }

    async getDecks(): Promise<SavedDeck[]> {
        const db = await this.dbPromise;
        const decks = await db.getAll('decks');
        if (decks.length === 0) {
            await this.initializeStarterDecks();
            return db.getAll('decks');
        }
        return decks;
    }

    private async initializeStarterDecks() {
        const starterDecks = getStarterDecks();
        const savedCol = await this.getCollection();
        const collection = new Collection(savedCol);

        for (let i = 0; i < starterDecks.length; i++) {
            const deck = starterDecks[i];
            const savable = deck.getSavable();
            savable.id = Date.now() + i;
            await this.saveDeck(savable);
            collection.addDeck(deck);
        }

        await this.saveCollection(collection.getSavable());
    }

    async saveDeck(deck: SavedDeck): Promise<number> {
        const db = await this.dbPromise;
        if (!deck.id || deck.id === -1) {
            deck.id = Date.now();
        }
        await db.put('decks', deck);
        return deck.id;
    }

    async deleteDeck(id: number): Promise<void> {
        const db = await this.dbPromise;
        await db.delete('decks', id);
    }

    async getCollection(): Promise<SavedCollection> {
        const db = await this.dbPromise;
        const col = await db.get('collection', 'main');
        if (!col) {
            return {
                records: [],
                packs: 3,
                gold: 0
            } as SavedCollection;
        }
        return col;
    }

    async saveCollection(collection: SavedCollection): Promise<void> {
        const db = await this.dbPromise;
        await db.put('collection', collection, 'main');
    }
}
