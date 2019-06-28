import { Component, OnInit } from '@angular/core';
import { EditorDataService } from '../editor-data.service';
import { SetInformation, CardSet } from 'app/game_model/cardSet';
import { CardData, cardList } from 'app/game_model/cards/cardList';

@Component({
    selector: 'ccg-set-selector',
    templateUrl: './set-selector.component.html',
    styleUrls: ['./set-selector.component.scss']
})
export class SetSelectorComponent implements OnInit {
    public setsLoaded = false;
    public cardsLoaded = false;
    public sets: SetInformation[] = [];
    public cardList = cardList;

    public set?: (CardSet | SetInformation);
    public cards: CardData[] = [];

    constructor(public data: EditorDataService) {
        data.getPublicSets().then(sets => {
            this.sets = sets;
            this.setsLoaded = true;
        });
    }

    public describe(setInfo: SetInformation) {
        if (setInfo === this.set) {
            return setInfo.description.split('\n');
        }
        return [setInfo.description.substr(0, 100)];
    }

    public selectSet(setInfo: SetInformation) {
        this.cardsLoaded = false;
        this.set = setInfo;
        this.data.getSet(setInfo).then(set => {
            this.cards = set.cards;
            this.cardsLoaded = true;
        });
    }

    ngOnInit() {}
}
