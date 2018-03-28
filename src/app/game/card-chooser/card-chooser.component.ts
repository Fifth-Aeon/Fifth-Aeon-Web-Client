import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { Card } from 'fifthaeon/card';

@Component({
  selector: 'ccg-card-chooser',
  templateUrl: './card-chooser.component.html'
})
export class CardChooserComponent {
  public cards: Array<Card>;
  public pageCards: Array<Card>;
  public min = 0;
  public max = 1;
  public skippable = false;
  public selected: Set<Card> = new Set();
  public pageNumber = 0;
  private pageSize = 5;
  public suffix: string;

  constructor(public dialogRef: MatDialogRef<CardChooserComponent>) {
    this.pageCards = [];
  }

  getMessage() {
    if (this.max === 0)
      return 'View cards';
    let ending = `${this.max === 1 ? 'a card' : this.max + ' cards'} ${this.suffix}.`;
    if (this.max === this.min)
      return `Choose ${ending}`;
    if (this.min === 0)
      return `Choose up to ${ending}`;
    return `Choose between ${this.min === 1 ? 'a card' : this.min + ' cards'} and ${ending}`;
  }

  public select(card) {
    if (this.selected.has(card)) {
      this.selected.delete(card);
    } else if (this.selected.size < this.max) {
      this.selected.add(card);
    }
  }

  public onResize(rect: ClientRect) {
    let width = rect.right - rect.left;
    this.pageSize = Math.floor(width / 175) * 2;
    this.setPage();
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

  public setPage() {
    this.pageCards = this.cards.slice(this.pageNumber * this.pageSize, this.pageNumber * this.pageSize + this.pageSize);
  }

  public canFinish(): boolean {
    return this.selected.size >= this.min ||
      this.selected.size === this.cards.length;
  }

  public finish() {
    this.dialogRef.close(Array.from(this.selected.values()));
  }

  public skip() {
    this.dialogRef.close([]);
  }
}

