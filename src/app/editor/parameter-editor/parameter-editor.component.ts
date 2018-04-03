import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ParameterType, ParamaterData} from 'fifthaeon/cards/parameters';

@Component({
  selector: 'ccg-parameter-editor',
  templateUrl: './parameter-editor.component.html',
  styleUrls: ['./parameter-editor.component.scss']
})
export class ParameterEditorComponent implements OnInit {
  @Input() name: string;
  @Input() type: ParameterType;
  @Input() data: ParamaterData;
  @Output() change: EventEmitter<ParamaterData> = new EventEmitter<ParamaterData>();

  constructor() { }

  onChange(event) {
    this.change.emit(this.data);
  }

  ngOnInit() {
  }

}
