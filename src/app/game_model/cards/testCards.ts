import { Mechanic } from '../mechanic';
import { Card } from '../card';
import { Unit } from '../unit';
import { SingleUnit } from '../targeter';
import { DealDamage } from './mechanics/dealDamage';
import { Resource } from '../resource';

export class DamageCard extends Card {
    dataId = 'DamageCard';
    public name = 'Test Spell';
    protected cost = new Resource(1);
    protected targeter = new SingleUnit();
    protected mechanics = [new DealDamage(1, this.targeter)];
}

export class BasicUnit extends Unit {
    dataId = 'BasicUnit';
    public name = 'Test Unit';
    protected cost = new Resource(1)
    protected maxLife = 2;
    protected life = 2;
    protected damage = 2;
}

