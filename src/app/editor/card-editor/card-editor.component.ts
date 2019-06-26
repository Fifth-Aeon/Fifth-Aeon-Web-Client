import { Component, OnInit } from '@angular/core';
import {
    UnitData,
    cardList,
    CardData,
    defaultDataObj
} from '../../game_model/cards/cardList';
import { UnitType } from '../../game_model/card-types/unit';
import { Card, CardType } from '../../game_model/card-types/card';
import { Route, ActivatedRoute, Router } from '@angular/router';
import { EditorDataService } from '../editor-data.service';
import { MatSelectChange } from '@angular/material';
import { mechanicList } from '../../game_model/cards/mechanicList';

@Component({
    selector: 'ccg-card-editor',
    templateUrl: './card-editor.component.html',
    styleUrls: ['./card-editor.component.scss']
})
export class CardEditorComponent implements OnInit {
    private static MaxRequirementTotal = 6;

    public unitTypes = UnitType;
    public unitTypeKeys = this.getKeys(UnitType).filter(key => key !== 0);
    public cardTypes = CardType;
    public cardTypeKeys = this.getKeys(CardType);
    public previewCard: Card = cardList.buildInstance(defaultDataObj);
    public data: CardData = defaultDataObj;

    constructor(
        route: ActivatedRoute,
        router: Router,
        editorData: EditorDataService
    ) {
        setInterval(() => this.refreshPreview(), 3000);
        route.paramMap.subscribe(params => {
            const id = params.get('id') as string;
            const card = editorData.getCard(id);
            if (card) {
                this.data = card;
                this.refreshPreview();
            } else {
                console.error('No card with id', id);
            }
        });
    }

    public changeType(event: MatSelectChange) {
        this.data.mechanics = this.data.mechanics.filter(mechanic =>
            mechanicList.isValid(this.data, mechanic)
        );
    }

    public fileChange(event: any): void {
        const files: FileList = event.target.files;
        const image = files.item(0);
        if (image === null) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.data.imageUrl = e.target.result;
        };
        reader.readAsDataURL(image);
    }

    public refreshPreview() {
        this.previewCard = cardList.buildInstance(this.data);
    }

    // Enforce resource requirements summing up to 6 (so it fits in UI)
    public getReqMax(
        resourceName: 'synthesis' | 'growth' | 'renewal' | 'decay'
    ) {
        const total =
            (this.data.cost.renewal || 0) +
            (this.data.cost.synthesis || 0) +
            (this.data.cost.growth || 0) +
            (this.data.cost.decay || 0);
        return (
            CardEditorComponent.MaxRequirementTotal -
            total +
            (this.data.cost[resourceName] as number)
        );
    }

    public getKeys(enumeration: any) {
        return Object.keys(enumeration)
            .filter(key => !isNaN(parseInt(key, 10)))
            .map(key => parseInt(key, 10));
    }

    ngOnInit() {}
}
