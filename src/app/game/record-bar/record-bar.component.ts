import { Component, OnInit, Input } from '@angular/core';
import { Game, GameSyncEvent, SyncEventType } from 'fifthaeon/game';
import { Log, LogItem } from 'fifthaeon/log';
import { Card } from 'fifthaeon/card';

@Component({
  selector: 'ccg-record-bar',
  templateUrl: './record-bar.component.html',
  styleUrls: ['./record-bar.component.css']
})
export class RecordBarComponent {
  @Input() log: Log;
}
