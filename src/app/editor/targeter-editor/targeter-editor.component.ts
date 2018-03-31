import { Component, OnInit, Input } from '@angular/core';
import { targeterList, TargeterData } from 'fifthaeon/cards/targeterList';

@Component({
  selector: 'ccg-targeter-editor',
  templateUrl: './targeter-editor.component.html',
  styleUrls: ['./targeter-editor.component.scss']
})
export class TargeterEditorComponent implements OnInit {
  public targeterList = targeterList;
  @Input() data: TargeterData;

  constructor() { }

  ngOnInit() {
  }

}
