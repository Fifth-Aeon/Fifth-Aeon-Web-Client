import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Unit } from '../../game_model/unit';

@Component({
  selector: 'ccg-damage-distribution-dialog',
  templateUrl: './damage-distribution-dialog.component.html',
  styleUrls: ['./damage-distribution-dialog.component.scss']
})
export class DamageDistributionDialogComponent {
  public attacker: Unit;
  public defenders: Array<Unit>;

  constructor(public dialogRef: MatDialogRef<DamageDistributionDialogComponent>) {
  }

  orderChanged(order: Array<string>) {
    const indexes = order.map(ind => parseInt(ind, 10));
    const newOrder = indexes.map(index => this.defenders[index]);
    this.defenders = newOrder;
  }

  public done() {
    this.dialogRef.close(this.defenders);
  }

}

