import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardType } from '../../game_model/card';
import { cardList } from '../../game_model/cards/cardList';
import { ParameterData, ParameterType } from '../../game_model/cards/parameters';
import { ResourceType } from '../../game_model/resource';

enum EditorType {
    Numeric,
    Enumerable,
    Resource
}

interface EnumValue {
    id: string;
    name: string;
}

@Component({
    selector: 'ccg-parameter-editor',
    templateUrl: './parameter-editor.component.html',
    styleUrls: ['./parameter-editor.component.scss']
})
export class ParameterEditorComponent implements OnInit {
    @Input() name: string;
    @Input() type: ParameterType;
    @Input() data: ParameterData;
    @Output() change: EventEmitter<ParameterData> = new EventEmitter<
        ParameterData
    >();
    public EditorType = EditorType;

    private cardTypeValues = new Map<CardType, EnumValue[]>();
    private resourceEnumValues = this.getEnumValues(ResourceType);
    private cardEnumValues = this.getEnumValues(CardType);

    public getEditorType() {
        if (
            this.type === ParameterType.Integer ||
            this.type === ParameterType.NaturalNumber
        ) {
            return EditorType.Numeric;
        } else if (this.type === ParameterType.Resource) {
            return EditorType.Resource;
        } else {
            return EditorType.Enumerable;
        }
    }

    public getMin() {
        return this.type === ParameterType.Integer ? -99 : 1;
    }

    public getValues(): EnumValue[] {
        switch (this.type) {
            case ParameterType.ResourceType:
                return this.resourceEnumValues;
            case ParameterType.CardType:
                return this.cardEnumValues;
            case ParameterType.Card:
                return this.getCardTypeValues(null);
            case ParameterType.Spell:
                return this.getCardTypeValues(CardType.Spell);
            case ParameterType.Unit:
                return this.getCardTypeValues(CardType.Unit);
            case ParameterType.Item:
                return this.getCardTypeValues(CardType.Item);
            case ParameterType.Enchantment:
                return this.getCardTypeValues(CardType.Enchantment);
        }
    }

    private getEnumValues(enumeration): EnumValue[] {
        const results = [];
        for (const key in enumeration) {
            if (typeof enumeration[key] !== 'number') {
                results.push({
                    id: key,
                    name: enumeration[key]
                });
            }
        }
        return results;
    }

    public onChange(event) {
        this.change.emit(this.data);
    }

    public ngOnInit() {}

    private getCardTypeValues(type: CardType): EnumValue[] {
        if (!this.cardTypeValues.has(type)) {
            this.cardTypeValues.set(type, this.generateCardTypeValues(type));
        }
        return this.cardTypeValues.get(type);
    }

    private generateCardTypeValues(type: CardType): EnumValue[] {
        return cardList
            .getCards()
            .filter(card => !type || card.getCardType() === type)
            .map(card => {
                return {
                    id: card.getDataId(),
                    name: card.getName()
                };
            });
    }
}
