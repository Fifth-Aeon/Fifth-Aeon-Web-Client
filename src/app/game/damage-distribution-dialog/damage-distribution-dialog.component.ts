import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Unit } from '../../game_model/unit';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';


@Component({
    selector: 'ccg-damage-distribution-dialog',
    templateUrl: './damage-distribution-dialog.component.html',
    styleUrls: ['./damage-distribution-dialog.component.scss']
})
export class DamageDistributionDialogComponent {
    public attacker?: Unit;
    public defenders: Array<Unit> = [];

    constructor(
        public dialogRef: MatDialogRef<DamageDistributionDialogComponent>
    ) {}

    orderChanged(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.defenders, event.previousIndex, event.currentIndex);
    }

    public done() {
        this.dialogRef.close(this.defenders);
    }
}
