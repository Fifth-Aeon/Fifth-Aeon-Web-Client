import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';


@Component({
  selector: 'ccg-end-dialog',
  templateUrl: './end-dialog.component.html',
  styleUrls: ['./end-dialog.component.scss']
})
export class EndDialogComponent implements OnInit {
  public winner: boolean = false;
  public quit: boolean = false;
  
  constructor(public dialogRef: MatDialogRef<EndDialogComponent>) { }

  ngOnInit() {
  }

}
