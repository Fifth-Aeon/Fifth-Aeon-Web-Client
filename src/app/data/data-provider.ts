import { SavedDeck } from '../game_model/deckList';
import { SavedCollection } from '../game_model/collection';

export interface IDataProvider {
    getDecks(): Promise<SavedDeck[]>;
    saveDeck(deck: SavedDeck): Promise<number>; // Returns the ID
    deleteDeck(id: number): Promise<void>;

    getCollection(): Promise<SavedCollection>;
    saveCollection(collection: SavedCollection): Promise<void>;
}
