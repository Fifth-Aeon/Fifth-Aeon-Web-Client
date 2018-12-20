import { Component, OnInit } from '@angular/core';

import { DecksService } from '../decks.service';

@Component({
    templateUrl: './deck-chooser.component.html',
    styleUrls: ['./deck-chooser.component.scss']
})
export class DeckChooserComponent implements OnInit {
    constructor(public decksService: DecksService) {}
    ngOnInit() {}
}
