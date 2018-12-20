import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'ccg-end-dialog',
    templateUrl: './end-dialog.component.html',
    styleUrls: ['./end-dialog.component.scss']
})
export class EndDialogComponent implements OnInit {
    public winner = false;
    public quit = false;
    public rewards = 'Loading rewards...';

    constructor(public dialogRef: MatDialogRef<EndDialogComponent>) {}

    ngOnInit() {}
}
