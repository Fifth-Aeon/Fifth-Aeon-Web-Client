import { Component, OnInit } from '@angular/core';
import { EditorDataService } from '../editor-data.service';
import { CardData, cardList } from '../../game_model/cards/cardList';
import { AuthenticationService } from 'app/user/authentication.service';

@Component({
    selector: 'ccg-editor-list',
    templateUrl: './editor-list.component.html',
    styleUrls: ['./editor-list.component.scss']
})
export class EditorListComponent implements OnInit {
    public cardList = cardList;

    constructor(
        public editorData: EditorDataService,
        private auth: AuthenticationService
    ) {
        this.auth.setRedirect('/editor');
        this.auth.attemptLogin();
    }

    public getEditLink(card: CardData) {
        return `/editor/card/${card.id}`;
    }

    public newCard() {
        this.editorData.createCard('');
    }

    ngOnInit() {}
}
