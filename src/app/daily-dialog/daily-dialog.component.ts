import { Component, OnInit } from '@angular/core';
import { Card } from '../game_model/card-types/card';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'ccg-daily-dialog',
    templateUrl: './daily-dialog.component.html',
    styleUrls: ['./daily-dialog.component.scss']
})
export class DailyDialogComponent implements OnInit {
    public rewards: Array<Card> = [];
    public nextRewardTime = 0;

    constructor(public dialogRef: MatDialogRef<DailyDialogComponent>) {}

    ngOnInit() {}
}
