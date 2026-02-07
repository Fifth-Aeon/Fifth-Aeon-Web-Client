import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { SavedCollection } from '../game_model/collection';
import { SavedDeck } from '../game_model/deckList';
import { AuthenticationService } from '../user/authentication.service';
import { IDataProvider } from './data-provider';
import { apiURL } from '../url';

@Injectable()
export class ServerDataProvider implements IDataProvider {
    private deckSaveURL = `${apiURL}/api/cards/storeDeck`;
    private deckLoadUrl = `${apiURL}/api/cards/getDecks`;
    private deckDeleteUrl = `${apiURL}/api/cards/deleteDeck`;

    private collectionSaveURL = `${apiURL}/api/cards/storeCollection`;
    private collectionLoadUrl = `${apiURL}/api/cards/getCollection`;

    constructor(
        private http: HttpClient,
        private auth: AuthenticationService
    ) { }

    getDecks(): Promise<SavedDeck[]> {
        return lastValueFrom(this.http
            .get<SavedDeck[]>(this.deckLoadUrl, { headers: this.auth.getAuthHeader() }));
    }

    saveDeck(deck: SavedDeck): Promise<number> {
        return lastValueFrom(this.http
            .post(
                this.deckSaveURL,
                { deck: deck },
                { headers: this.auth.getAuthHeader() }
            ))
            .then((res: any) => res.id);
    }

    deleteDeck(id: number): Promise<void> {
        return lastValueFrom(this.http
            .post(
                this.deckDeleteUrl,
                { id: id },
                { headers: this.auth.getAuthHeader() }
            ))
            .then(() => { });
    }

    getCollection(): Promise<SavedCollection> {
        return lastValueFrom(this.http
            .get<SavedCollection>(this.collectionLoadUrl, {
                headers: this.auth.getAuthHeader()
            }));
    }

    saveCollection(collection: SavedCollection): Promise<void> {
        return lastValueFrom(this.http
            .post(
                this.collectionSaveURL,
                { collection: collection },
                { headers: this.auth.getAuthHeader() }
            ))
            .then(() => { });
    }
}
