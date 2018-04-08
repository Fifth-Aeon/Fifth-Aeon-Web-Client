import { Component, OnInit, ElementRef } from '@angular/core';
import { sortBy, random } from 'lodash';

import { DecksService } from '../decks.service';
import { GameFormat, standardFormat } from '../game_model/gameFormat';
import { DeckList } from '../game_model/deckList';
import { Card } from '../game_model/card';
import { DeckMetadataDialogComponent } from 'app/deck-metadata-dialog/deck-metadata-dialog.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Collection } from 'app/game_model/collection';
import { CollectionService } from 'app/collection.service';
import { Draft } from '../game_model/draft';
import { DraftService } from '../draft.service';


@Component({
  selector: 'ccg-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.scss']
})
export class DraftComponent {

  public draft: Draft;
  public selectable: Array<Card>;
  public deck: DeckList;
  public format = standardFormat;
  public retired = false;

  constructor(
    private decks: DecksService,
    private dialog: MatDialog,
    public draftService: DraftService
  ) {
    this.draft = draftService.getCurrentDraft();
    this.deck = this.draft.getDeck();
    if (this.draft.canPickCard())
      this.nextRound();
  }

  public retire() {
    let msg = this.draftService.retire();
    alert(msg);
    this.retired = true;
    this.selectable = [];
  }


  public done() {
    this.decks.finishEditing();
  }

  private nextRound() {
    this.selectable = Array.from(this.draft.getChoices());
  }

  public add(card: Card) {
    this.draft.pickCard(card);
    if (this.draft.canPickCard())
      this.nextRound();
    else
      this.selectable = [];
  }


}
