import { Component, OnInit } from '@angular/core';
import { EditorDataService } from '../editor-data.service';
import { SetInformation, CardSet } from 'app/game_model/cardSet';
import { CardData, cardList } from 'app/game_model/cards/cardList';
import { MatSlideToggleChange } from '@angular/material';
import { AuthenticationService } from 'app/user/authentication.service';

@Component({
    selector: 'ccg-set-selector',
    templateUrl: './set-selector.component.html',
    styleUrls: ['./set-selector.component.scss']
})
export class SetSelectorComponent implements OnInit {
    public setsLoaded = false;
    public cardsLoaded = false;
    public activeSetsLoaded = false;
    public sets: SetInformation[] = [];
    public cardList = cardList;
    public activeSets: Set<string> = new Set();

    public set?: (CardSet | SetInformation);
    public cards: CardData[] = [];

    constructor(public data: EditorDataService, private auth: AuthenticationService) {
        this.auth.setRedirect('/editor/selectMods');
        this.auth.attemptLogin();
        data.getPublicSets().then(sets => {
            this.sets = sets;
            this.setsLoaded = true;
        });
        data.getActiveSets().then(activeSets => {
            this.activeSets = activeSets;
            this.activeSetsLoaded = true;
        });
    }

    public setActive(setId: string, active: MatSlideToggleChange) {
        if (active) {
            this.activeSets.add(setId);
        } else {
            this.activeSets.delete(setId);
        }
        this.data.setSetActive(setId, active.checked);
    }

    public describe(setInfo: SetInformation) {
        if (setInfo === this.set) {
            return setInfo.description.split('\n');
        }
        return [setInfo.description.substr(0, 100)];
    }

    public selectSet(setInfo: SetInformation) {
        if (this.set && setInfo.id === this.set.id) {
            return;
        }
        this.cardsLoaded = false;
        this.set = setInfo;
        this.data.getSet(setInfo).then(set => {
            this.cards = set.cards;
            this.cardsLoaded = true;
        });
    }

    ngOnInit() {}
}
