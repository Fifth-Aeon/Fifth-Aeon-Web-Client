import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';


@Component({
  selector: 'ccg-end-dialog',
  templateUrl: './end-dialog.component.html',
  styleUrls: ['./end-dialog.component.scss']
})
export class EndDialogComponent implements OnInit {
  public winner = false;
  public quit = false;
  public rewards: string;

  constructor(public dialogRef: MatDialogRef<EndDialogComponent>) { }

  ngOnInit() {
  }

}
