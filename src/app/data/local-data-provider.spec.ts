import { LocalDataProvider } from './local-data-provider';
import { SavedDeck } from '../game_model/deckList';
import { SavedCollection } from '../game_model/collection';
import { openDB, deleteDB } from 'idb';

describe('LocalDataProvider', () => {
    let provider: LocalDataProvider;
    const dbName = 'ccg-data';

    beforeAll(async () => {
        // Ensure clean state
        await deleteDB(dbName);
    });

    beforeEach(() => {
        provider = new LocalDataProvider();
    });

    afterEach(async () => {
        // Cleanup after each test if necessary, but typically we want to persist for some sequences
        // For unit tests, maybe we clear the DB
        await deleteDB(dbName);
    });

    it('should save and retrieve a deck', async () => {
        const deck: SavedDeck = {
            id: -1,
            name: 'Test Deck',
            customMetadata: false,
            avatar: 'avatar',
            records: [['card1', 1], ['card2', 1]]
        };

        const id = await provider.saveDeck(deck);
        expect(id).toBeGreaterThan(0);

        const decks = await provider.getDecks();
        expect(decks.length).toBe(1);
        expect(decks[0].name).toBe('Test Deck');
        expect(decks[0].records).toEqual([['card1', 1], ['card2', 1]]);
    });

    it('should update an existing deck', async () => {
        const deck: SavedDeck = {
            id: -1,
            name: 'Original Name',
            customMetadata: false,
            avatar: '',
            records: []
        };

        const id = await provider.saveDeck(deck);
        deck.id = id;
        deck.name = 'Updated Name';

        await provider.saveDeck(deck);

        const decks = await provider.getDecks();
        expect(decks.length).toBe(1);
        expect(decks[0].id).toBe(id);
        expect(decks[0].name).toBe('Updated Name');
    });

    it('should delete a deck', async () => {
        const deck: SavedDeck = {
            id: -1,
            name: 'To Delete',
            customMetadata: false,
            avatar: '',
            records: []
        };

        const id = await provider.saveDeck(deck);
        let decks = await provider.getDecks();
        expect(decks.length).toBe(1);

        await provider.deleteDeck(id);
        decks = await provider.getDecks();
        expect(decks.length).toBe(0);
    });

    it('should save and retrieve collection', async () => {
        const collection: SavedCollection = {
            records: [['card1', 2]],
            packs: 1,
            gold: 100
        };

        await provider.saveCollection(collection);
        const retrieved = await provider.getCollection();

        expect(retrieved).toBeTruthy();
        expect(retrieved.records).toEqual([['card1', 2]]);
        expect(retrieved.packs).toBe(1);
        expect(retrieved.gold).toBe(100);
    });

    it('should return empty collection if none exists', async () => {
        const retrieved = await provider.getCollection();
        expect(retrieved).toBeDefined();
        // Assuming default is empty object or null, implementation will decide
        // Based on interface, it returns SavedCollection, so likely an empty/default one
    });
});
