import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CollectionService } from 'app/collection.service';
import { DecksService } from '../decks.service';
import { DraftService } from '../draft.service';
import { Card } from '../game_model/card-types/card';
import { DeckList } from '../game_model/deckList';
import { Draft } from '../game_model/draft';
import { standardFormat } from '../game_model/gameFormat';
import { TipService, TipType } from '../tips';

@Component({
    selector: 'ccg-draft',
    templateUrl: './draft.component.html',
    styleUrls: ['./draft.component.scss']
})
export class DraftComponent {
    public draft?: Draft;
    public loaded = false;
    public selectable: Array<Card> = [];
    public deck: DeckList = new DeckList();
    public format = standardFormat;
    public retired = false;

    constructor(
        private decks: DecksService,
        private dialog: MatDialog,
        public draftService: DraftService,
        private collection: CollectionService,
        tips: TipService
    ) {
        tips.playTip(TipType.Draft);
        draftService.getCurrentDraft().then(draft => {
            this.draft = draft;
            if (draft) {
                this.deck = draft.getDeck();
                if (draft.canPickCard()) {
                    this.nextRound();
                }
            }
            this.loaded = true;
        });
    }

    public canBuy() {
        return this.collection.getCollection().getGold() >= Draft.cost;
    }

    public start() {
        this.draftService.startDraft().then(result => {
            if (typeof result === 'string') {
                alert(result);
            } else {
                this.draftService.getCurrentDraft().then(draft => {
                    this.collection.getCollection().removeGold(Draft.cost);
                    if (draft === undefined) {
                        throw new Error();
                    }
                    this.draft = draft;
                    this.deck = this.draft.getDeck();
                    if (this.draft.canPickCard()) {
                        this.nextRound();
                    }
                });
            }
        });
    }

    public retire() {
        this.draftService.retire().then(msg => {
            alert(msg);
        });
        this.retired = true;
        this.selectable = [];
    }

    public done() {
        this.decks.finishEditing();
    }

    private nextRound() {
        if (this.draft === undefined) {
            throw new Error('Draft no started.');
        }
        this.selectable = Array.from(this.draft.getChoices());
    }

    public add(card: Card) {
        if (this.draft === undefined) {
            throw new Error('Draft no started.');
        }
        this.draft.pickCard(card);
        if (this.draft.canPickCard()) {
            this.nextRound();
        } else {
            this.selectable = [];
        }
        this.draftService.saveDraftData();
    }
}
