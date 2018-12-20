import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { CollectionService } from 'app/collection.service';
import { DeckMetadataDialogComponent } from 'app/deck-metadata-dialog/deck-metadata-dialog.component';
import { Collection } from 'app/game_model/collection';
import { random, sortBy } from 'lodash';
import { DecksService } from '../decks.service';
import { Card } from '../game_model/card';
import { DeckList } from '../game_model/deckList';
import { GameFormat } from '../game_model/gameFormat';

@Component({
    selector: 'ccg-deck-editor',
    templateUrl: './deck-editor.component.html',
    styleUrls: ['./deck-editor.component.scss'],
    entryComponents: [DeckMetadataDialogComponent]
})
export class DeckEditorComponent implements OnInit {
    public cards: Array<Card>;
    public collection: Collection;
    public pageCards: Array<Card>;
    public pageNumber = 0;
    private pageSize = 10;
    public deck: DeckList;
    public format = new GameFormat();

    constructor(
        private decks: DecksService,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        collectionService: CollectionService
    ) {
        this.collection = collectionService.getCollection();
        this.cards = sortBy(
            sortBy(this.collection.getCards(), (card: Card) => card.getName()),
            (card: Card) =>
                card.getCost().getColor() * 10000 + card.getCost().getNumeric()
        );
        this.deck = this.decks.getEditDeck();
    }

    public import() {
        const text = prompt('Copy paste the deck code here.');
        try {
            this.deck.fromJson(text);
            this.snackbar.open('Import succeeded.', '', { duration: 2000 });
        } catch (e) {
            this.snackbar.open('Import Failed.', '', { duration: 2000 });
        }
    }

    public export() {
        this.snackbar.open('Deck copied to clipboard.', '', { duration: 2000 });
    }

    public onResize(rect: ClientRect) {
        const width = rect.right - rect.left;
        this.pageSize = Math.floor(width / 180) * 2;
        this.setPage();
    }

    public openMetadata() {
        const dialogRef = this.dialog.open(DeckMetadataDialogComponent);
        dialogRef.componentInstance.deck = this.deck;
    }

    public done() {
        this.decks.finishEditing();
    }

    public randomize() {
        this.deck.generateRandomNColorDeck(random(1, 4), this.collection);
    }

    public canAddCard(card: Card) {
        return (
            this.deck.getCardCount(card) < this.collection.getCardCount(card) &&
            this.deck.canAddCard(card)
        );
    }

    public add(card: Card) {
        if (!this.canAddCard(card)) {
            return;
        }
        this.deck.addCard(card);
    }

    public canNext() {
        return this.pageNumber + 1 < this.cards.length / this.pageSize;
    }

    public next() {
        this.pageNumber++;
        this.setPage();
    }

    public canPrev() {
        return this.pageNumber !== 0;
    }

    public prev() {
        this.pageNumber--;
        this.setPage();
    }

    private setPage() {
        this.pageCards = this.cards.slice(
            this.pageNumber * this.pageSize,
            this.pageNumber * this.pageSize + this.pageSize
        );
    }

    ngOnInit() {
        this.onResize(
            document.getElementById('editor-cards').getBoundingClientRect()
        );
    }
}
