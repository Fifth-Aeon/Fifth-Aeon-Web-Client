import { Component, OnInit } from '@angular/core';
import { EditorDataService } from '../editor-data.service';
import { AuthenticationService } from 'app/user/authentication.service';
import { CardData, cardList } from 'app/game_model/cards/cardList';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'ccg-set-cards-editor',
    templateUrl: './set-cards-editor.component.html',
    styleUrls: ['./set-cards-editor.component.scss']
})
export class SetCardsEditorComponent implements OnInit {
    private setId = '';
    public cardList = cardList;
    private cardInSet = new Set<string>();
    public cards: CardData[] = [];
    public loading = true;

    constructor(
        public editorData: EditorDataService,
        private auth: AuthenticationService,
        route: ActivatedRoute
    ) {
        this.auth.onAuth(user => (this.cards = editorData.getCards()));
        route.paramMap.subscribe(params => {
            this.setId = params.get('id') as string;
            this.cardInSet = editorData.getCardsInSet(this.setId);
            this.loading = false;

        });
    }

    public toggleCardInSet(card: CardData) {
        if (this.cardInSet.has(card.id)) {
            this.cardInSet.delete(card.id);
            this.editorData.removeCardFromSet(this.setId, card.id);
        } else {
            this.cardInSet.add(card.id);
            this.editorData.addCardToSet(this.setId, card.id);
        }
    }

    public isCardInSet(card: CardData) {
        return this.cardInSet.has(card.id);
    }

    ngOnInit() {}
}
