import { Injectable } from '@angular/core';
import { Draft } from './game_model/draft';
import { WebClient } from './client';
import { CollectionService } from './collection.service';

@Injectable()
export class DraftService {
  private currentDraft: Draft = null;

  constructor(
    private client: WebClient,
    private collection: CollectionService
  ) {}

  private startDraft() {
    this.currentDraft = new Draft();
  }

  public endDraft() {
    let rewards = this.currentDraft.getRewards();
    this.collection.getCollection().addReward(rewards);
    this.currentDraft = null;
    return rewards;
  }

  public playGame() {
    if (!this.currentDraft.canPlayGame())
      return;
    this.client.onGameEnd = (won) => this.onGameEnd(won);
    this.client.setDeck(this.currentDraft.getDeck());
    this.client.startAIGame();
  }

  public retire() {
    this.currentDraft.retire();
    return CollectionService.describeReward(this.endDraft());
  }

  private onGameEnd(won: boolean) {
    this.currentDraft.updateRecord(won);
    this.client.onGameEnd = null;
    if (!this.currentDraft.hasEnded())
      return `You have ${this.currentDraft.getWins()} wins and ${this.currentDraft.getLosses()} losses this draft.`;
    return CollectionService.describeReward(this.endDraft());
  }

  public getCurrentDraft() {
    if (this.currentDraft === null)
      this.startDraft();
    return this.currentDraft;
  }

}
