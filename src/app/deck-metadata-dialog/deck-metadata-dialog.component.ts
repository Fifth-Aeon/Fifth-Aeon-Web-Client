import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DeckList } from 'app/game_model/deckList';

@Component({
  selector: 'ccg-deck-metadata-dialog',
  templateUrl: './deck-metadata-dialog.component.html',
  styleUrls: ['./deck-metadata-dialog.component.scss']
})
export class DeckMetadataDialogComponent implements OnInit {
  public deck: DeckList;

  constructor(public dialogRef: MatDialogRef<DeckMetadataDialogComponent>) { }

  ngOnInit() {
  }

  public done() {
    this.deck.customMetadata = true;
    this.dialogRef.close([]);
  }

}
