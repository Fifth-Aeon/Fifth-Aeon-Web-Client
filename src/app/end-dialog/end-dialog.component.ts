import { Component, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';


@Component({
  selector: 'bsc-end-dialog',
  templateUrl: './end-dialog.component.html',
  styleUrls: ['./end-dialog.component.scss']
})
export class EndDialogComponent implements OnInit {
  public winner: boolean = false;
  public quit: boolean = false;
  
  constructor(public dialogRef: MdDialogRef<EndDialogComponent>) { }

  ngOnInit() {
  }

}
