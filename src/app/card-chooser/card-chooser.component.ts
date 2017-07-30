import { Component, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';

import { Card } from '../game_model/card';

@Component({
  selector: 'bsc-card-chooser',
  templateUrl: './card-chooser.component.html'
})
export class CardChooserComponent {

  public cards: Array<Card>;
  public numberToPick: number = 1;
  public skipable: boolean = true;
  public selected: Set<Card> = new Set();

  constructor(public dialogRef: MdDialogRef<CardChooserComponent>) { }

  select(card) {
    if (this.selected.has(card)) {
        this.selected.delete(card)
    } else if (this.selected.size < this.numberToPick) {
      this.selected.add(card);
    }
  }

  canFinish(): boolean {
    return this.selected.size >= this.numberToPick ||
      this.selected.size >= this.cards.length;
  }

  finish() {
    this.dialogRef.close(Array.from(this.selected.values()));
  }

  skip() {
    this.dialogRef.close([]);
  }


}

