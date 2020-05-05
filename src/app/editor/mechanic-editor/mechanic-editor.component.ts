import { Component, Input } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Card } from '../../game_model/card-types/card';
import { cardList, SpellData, defaultDataObj } from '../../game_model/cards/cardList';
import {
    MechanicData,
    mechanicList
} from '../../game_model/cards/mechanicList';
import { buildParameters } from '../../game_model/cards/parameters';
import { targeterList } from '../../game_model/cards/targeterList';
import { triggerList } from '../../game_model/cards/triggerList';

@Component({
    selector: 'ccg-mechanic-editor',
    templateUrl: './mechanic-editor.component.html',
    styleUrls: ['./mechanic-editor.component.scss']
})
export class MechanicEditorComponent {
    public mechanicList = mechanicList;
    @Input() public card: SpellData = defaultDataObj;

    constructor() {
        // this.mechanics = this.mechanicList.getConstructors(this.card.cardType);
    }

    public changeMechanic(data: MechanicData, event: MatSelectChange) {
        const paramTypes = mechanicList
            .getParameters(data)
            .map(param => param.type);
        data.parameters = buildParameters(paramTypes, [], cardList, new Map()).map(
            param => {
                if (typeof param !== 'function') {
                    return param;
                }
                const card = param() as Card;
                return card.getDataId();
            }
        );
    }

    public add() {
        const validMechanics = mechanicList.getConstructors(this.card.cardType);
        if (validMechanics.length === 0) {
            return;
        }
        this.card.mechanics.push({
            id: validMechanics[0].getId(),
            parameters: [],
            trigger: { id: 'Play' },
            targeter: { id: 'Host', optional: false }
        });
    }

    public delete(index: number) {
        this.card.mechanics.splice(index, 1);
    }

    public setParam(mechanic: MechanicData, i: number, event: any) {
        if (typeof event === 'object' && event.target) {
            mechanic.parameters[i] = event.target.value;
        } else {
            mechanic.parameters[i] = event;
        }
    }

    public isTriggered(mechanic: MechanicData) {
        return mechanicList.isTriggered(mechanic);
    }

    public isTargeted(mechanic: MechanicData) {
        return mechanicList.isTargeted(mechanic);
    }

    public getTriggerIds() {
        return triggerList.getIds();
    }

    public getTargeterIds() {
        return targeterList.getIds(true);
    }

    public moveUp(index: number) {
        this.swap(index, index - 1);
    }

    public moveDown(index: number) {
        this.swap(index, index + 1);
    }

    private swap(i: number, j: number) {
        const temp = this.card.mechanics[i];
        this.card.mechanics[i] = this.card.mechanics[j];
        this.card.mechanics[j] = temp;
    }
}
