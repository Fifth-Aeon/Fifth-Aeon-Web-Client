import { serialize, serializeAs, deserialize } from 'cerialize';

import { Resource } from './resource';
import { Game } from './game';
import { Player } from './player';
import { Mechanic } from './mechanic';
import { Targeter, Untargeted } from './targeter';
import { remove } from 'lodash';


export abstract class Card {
    
    @serialize @deserialize public name: string;
    @serialize @deserialize protected id: string;
    @serialize @deserialize protected set: string;
    @serialize @deserialize protected rarity: number;
    @serializeAs(Mechanic) protected mechanics: Mechanic[] = [];

    @serializeAs(Resource) protected cost: Resource;
    @serialize @deserialize protected unit = false;
    @serialize @deserialize protected owner: number;
    @serialize @deserialize abstract dataId: string;

    protected targeter: Targeter<any> = new Untargeted();

    constructor() {
        this.id = Math.random().toString(16)
    }

    public getDataId() {
        return this.dataId;
    }
    public getId() {
        return this.id;
    }

    public play(game: Game) {
        //this.owner.mana -= this.cost;
    }

    public getText():string {
        return this.mechanics.map(mechanic => mechanic.getText(this)).join(' ');
    }

    public getTargeter() {
        return this.targeter;
    }

    public setOwner(owner: number) {
        this.owner = owner;
    }

    public setId(id:string) {
        this.id = id;
    }

    public getOwner() {
        return this.owner;
    }

    public getName() {
        return this.name;
    }

    public isUnit(): boolean {
        return this.unit;
    }

    public toString(): string {
        return `${this.name}: (${this.cost})`
    }



    public getActions(battle: Game) {
        let entities = battle.getCurrentPlayerEntities();
        let targets = [];
        return [];
    }
}
