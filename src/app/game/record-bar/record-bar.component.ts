import { Component, Input } from '@angular/core';
import { Log } from '../../game_model/log';

@Component({
    selector: 'ccg-record-bar',
    templateUrl: './record-bar.component.html',
    styleUrls: ['./record-bar.component.css']
})
export class RecordBarComponent {
    @Input() log: Log;
}
