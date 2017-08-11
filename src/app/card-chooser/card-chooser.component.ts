import { Component, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';

import { Card } from '../game_model/card';

@Component({
  selector: 'bsc-card-chooser',
  templateUrl: './card-chooser.component.html'
})
export class CardChooserComponent {
  public cards: Array<Card>;
  public pageCards: Array<Card>;
  public numberToPick: number = 1;
  public skipable: boolean = true;
  public selected: Set<Card> = new Set();
  public pageNumber: number = 0;
  private pageSize: number = 5;

  constructor(public dialogRef: MdDialogRef<CardChooserComponent>) {
    this.pageCards = [];
  }

  public select(card) {
    if (this.selected.has(card)) {
      this.selected.delete(card);
    } else if (this.selected.size < this.numberToPick) {
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
    return this.pageNumber != 0;
  }

  public prev() {
    this.pageNumber--;
    this.setPage();
  }

  public setPage() {
    this.pageCards = this.cards.slice(this.pageNumber * this.pageSize, this.pageNumber * this.pageSize + this.pageSize);
  }

  public canFinish(): boolean {
    return this.selected.size >= this.numberToPick ||
      this.selected.size >= this.cards.length;
  }

  public finish() {
    this.dialogRef.close(Array.from(this.selected.values()));
  }

  public skip() {
    this.dialogRef.close([]);
  }
}

