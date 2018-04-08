import { Component, OnInit, Input } from '@angular/core';
import { Game, GameSyncEvent, SyncEventType } from '../../game_model/game';
import { Log, LogItem } from '../../game_model/log';
import { Card } from '../../game_model/card';

@Component({
  selector: 'ccg-record-bar',
  templateUrl: './record-bar.component.html',
  styleUrls: ['./record-bar.component.css']
})
export class RecordBarComponent {
  @Input() log: Log;
}
