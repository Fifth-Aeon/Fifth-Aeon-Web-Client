import { Injectable } from '@angular/core';
import { Draft, SavedDraft } from './game_model/draft';
import { WebClient } from './client';
import { CollectionService } from './collection.service';
import { AuthenticationService } from './user/authentication.service';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { apiURL } from './url';
import { Rewards } from './game_model/collection';

@Injectable()
export class DraftService {
    private static startURL = `${apiURL}/api/drafts/startDraft`;
    private static updateURL = `${apiURL}/api/drafts/updateDraft`;
    private static getURL = `${apiURL}/api/drafts/getDraft`;
    private static endURL = `${apiURL}/api/drafts/endDraft`;

    private currentDraft: Draft | null = null;

    constructor(
        private client: WebClient,
        public collection: CollectionService,
        private auth: AuthenticationService,
        private http: HttpClient
    ) { }

    public startDraft() {
        return lastValueFrom(this.http
            .post(
                DraftService.startURL,
                {},
                { headers: this.auth.getAuthHeader() }
            ))
            .then(resp => {
                this.currentDraft = new Draft();
                return this.currentDraft;
            })
            .catch(resp => {
                console.error(resp);
                return resp.error.message as String;
            });
    }

    public endDraft() {
        if (!this.currentDraft) {
            throw new Error('Cannot end draft that is not in progress');
        }
        return lastValueFrom(this.http
            .post<{ message: string; reward: Rewards }>(
                DraftService.endURL,
                { draftData: this.currentDraft.toSavable() },
                { headers: this.auth.getAuthHeader() }
            ))
            .then(resp => {
                this.collection.getCollection().addReward(resp.reward);
                this.currentDraft = null;
                return resp.reward;
            });
    }

    public saveDraftData() {
        if (!this.currentDraft) {
            throw new Error('Cannot save draft that is not in progress');
        }
        return lastValueFrom(this.http
            .post(
                DraftService.updateURL,
                { draftData: this.currentDraft.toSavable() },
                { headers: this.auth.getAuthHeader() }
            ))
            .catch(console.error);
    }

    public playGame() {
        if (!this.currentDraft || !this.currentDraft.canPlayGame()) {
            return;
        }
        this.client.getGameReward = won => this.onGameEnd(won);
        this.client.setDeck(this.currentDraft.getDeck());
        this.client.startAIGame();
    }

    public async retire() {
        if (!this.currentDraft) {
            throw new Error('Draft not in progress');
        }
        this.currentDraft.retire();
        return CollectionService.describeReward(await this.endDraft());
    }

    private async onGameEnd(won: boolean) {
        if (!this.currentDraft) {
            throw new Error('Draft not in progress');
        }
        this.currentDraft.updateRecord(won);
        this.client.getGameReward = null;
        if (!this.currentDraft.hasEnded()) {
            this.saveDraftData();
            return `You have ${this.currentDraft.getWins()} wins and ${this.currentDraft.getLosses()} losses this draft.`;
        }
        return CollectionService.describeReward(await this.endDraft());
    }

    public getServerDraft(): Promise<Draft | undefined> {
        return lastValueFrom(this.http
            .get<{ message: string; draftData: SavedDraft }>(
                DraftService.getURL,
                { headers: this.auth.getAuthHeader() }
            ))
            .then(resp => {
                this.currentDraft = new Draft(resp.draftData);
                return this.currentDraft;
            })
            .catch(err => {
                return Promise.resolve(undefined);
            });
    }

    public getCurrentDraft() {
        if (this.currentDraft === null) {
            return this.getServerDraft();
        }
        return Promise.resolve(this.currentDraft);
    }
}
