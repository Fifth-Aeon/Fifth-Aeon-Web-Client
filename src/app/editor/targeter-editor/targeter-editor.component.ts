import { Component, OnInit, Input } from '@angular/core';
import {
    targeterList,
    TargeterData
} from '../../game_model/cards/targeterList';

const dummyData: TargeterData = {
    id: '',
    optional: false
};

@Component({
    selector: 'ccg-targeter-editor',
    templateUrl: './targeter-editor.component.html',
    styleUrls: ['./targeter-editor.component.scss']
})
export class TargeterEditorComponent implements OnInit {
    public targeterList = targeterList;
    @Input() data: TargeterData = dummyData;

    constructor() {}

    ngOnInit() {}
}
