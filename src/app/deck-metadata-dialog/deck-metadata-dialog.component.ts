import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DeckList } from 'app/game_model/deckList';
import { Card } from 'app/game_model/card-types/card';

@Component({
    selector: 'ccg-deck-metadata-dialog',
    templateUrl: './deck-metadata-dialog.component.html',
    styleUrls: ['./deck-metadata-dialog.component.scss']
})
export class DeckMetadataDialogComponent implements OnInit {
    public deck: DeckList = new DeckList();
    public cards: Array<Card> = [];

    constructor(public dialogRef: MatDialogRef<DeckMetadataDialogComponent>) {}

    ngOnInit() {
        this.cards = this.deck.getRecordList().map(rec => rec.card);
    }

    public done() {
        this.deck.customMetadata = true;
        this.dialogRef.close([]);
    }
}
