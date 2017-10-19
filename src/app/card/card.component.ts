import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Card, Location, CardType } from '../game_model/card';
import { Unit, UnitType } from '../game_model/unit';
import { Game } from '../game_model/game';

import { allCards } from '../game_model/cards/allCards';

import { OverlayService } from '../overlay.service';

enum GlowType {
  None, Select, Attack, Defense, Targeted
}

const keywordsDefs = new Map<string, string>();

// Evasion
keywordsDefs.set('Flying', 'Can only be blocked by units with flying or ranged.')
keywordsDefs.set('Ranged', 'Can block units with flying.')
keywordsDefs.set('Aquatic', 'Can only be blocked by units with aquatic or flying and can only block other aquatic units.')
keywordsDefs.set('Unblockable', 'Can not be blocked.');

keywordsDefs.set('Rush', 'Can attack the turn it is played.')
keywordsDefs.set('Lifesteal', 'When this unit deals damage its owner gains that much life.')
keywordsDefs.set('Final Blow', 'Triggers whenever this unit deals lethal damage to another unit.')
keywordsDefs.set('Poisoned', 'This unit gets -1/-1 at the start of its owner\'s turn.')
keywordsDefs.set('Poison', 'Causes a unit to become poisoned. Poisoned units get -1/-1 at the start of their owner\'s turn.')
keywordsDefs.set('Venomous', 'Poisons any unit it damages. Poisoned units get -1/-1 at the start of their owner\'s turn.')
keywordsDefs.set('Affinity', 'Triggers the first time you play a unit of the same type.')
keywordsDefs.set('Serenity', 'Triggers at the end of your turn if you did not attack that turn.')
keywordsDefs.set('Mechanical', 'A unit of the Automaton, Structure or Vehicle types.')
keywordsDefs.set('Biological', 'A unit of not of the Automaton, Structure or Vehicle types.')
keywordsDefs.set('Lethal', 'Kill any unit damaged by this unit.')
keywordsDefs.set('Shielded', 'The first time this takes damage, negate that damage.')
keywordsDefs.set('Relentless', 'Refreshes at the end of each turn.')
keywordsDefs.set('Deathless', 'When this dies, play it again at the end of the turn. It loses this ability.')
keywordsDefs.set('Sleeping', 'This unit does not ready at the start of its owners turn. Instead its sleep counter decreases by 1.')
keywordsDefs.set('Sleep', 'Exausts a unit and prevents it from readying.')
keywordsDefs.set('Robotic', 'Immune to sleep and poison.')
keywordsDefs.set('Immortal', 'Whenever this unit dies, play it from the crypt at the end of the turn (it keeps this ability).')

keywordsDefs.set('Statue', 'A 0/1 structure that cannot attack.')

const unitsDescs = new Map<string, string>();
Array.from(allCards.values()).map(fact => fact())
  .filter(card => card.isUnit())
  .forEach(card => {
    let unit = card as Unit;
    let base = `${unit.getDamage()}/${unit.getLife()} ${UnitType[unit.getCardType()]}`;
    if (unit.getText(this.game).length > 0)
      base += ` with "${unit.getText(this.game)}"`
    keywordsDefs.set(unit.getName(), base);
  })

const keywords = Array.from(keywordsDefs.keys());
const keywordRegex = new RegExp(keywords.join('|'), 'gi');
//const unitNames = Array.from(unitsDescs.keys());
//const unitsRegex = new RegExp(unitNames.join('|'), 'gi');

function toProperCase(str: string) {
  return str.replace(/\b\w/g, l => l.toUpperCase())
}

@Component({
  selector: 'ccg-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() card: Card;
  @Input() game: Game;
  @Input() scale: number;
  @Input() distFromMid: number;
  sizeY: number;
  sizeX: number;
  padding = 30;
  hovered: boolean = false;
  @Input() darkened: boolean = false;
  @Input() selected: boolean = false;
  @Input() target: boolean = false;
  @Input() overlap: boolean = false;

  constructor(private overlay: OverlayService, private element: ElementRef) {
  }

  public getResUrl(type: string) {
    switch (type) {
      case 'G':
        return 'assets/png/growth-small.png';
      case 'S':
        return 'assets/png/synthesis-small.png';
      case 'D':
        return 'assets/png/decay-small.png';
      case 'R':
        return 'assets/png/renewal-small.png';
    }
  }

  public getSymbolSize() {
    return this.y() * 0.10 - 3;
  }

  public getSymbolPadding() {
    // Area - symbol size / max symbols
    return (this.x() - 27.5 - this.getSymbolSize() * 6) / (12);
  }

  public isItem(card: Card) {
    return card.getCardType() == CardType.Item;
  }

  public getType(type: UnitType) {
    return UnitType[type];
  }

  public getMargins() {
    let marginLeft = -9;
    let marginRight = -9;
    if (this.overlap) {
      if (this.hovered) {
        marginRight = 41;
        marginLeft = -9;
      } else {
        marginLeft = -50;
      }
    }
    let rotation = this.hovered ? 0 : 3 * this.distFromMid;
    let dispY = this.overlap ? Math.abs(this.distFromMid == 0 ? 0.5 : this.distFromMid) * 4 : 0;
    marginRight -= Math.abs(this.distFromMid) * 5;
    marginLeft -= Math.abs(this.distFromMid) * 5;
    if (this.hovered && this.overlap)
      dispY = -10;
    let css = {
      'margin-left': marginLeft + 'px',
      'margin-right': marginRight + 'px',
      'transform': `translateY(-${50 - dispY}%) rotate(${rotation}deg)`
    }
    return css;
  }

  public htmlText(text: string) {
    return text.replace(keywordRegex, '<b>$&</b>');
  }

  private getKeywords() {
    return Array.from(new Set(this.card.getText(this.game).match(keywordRegex)));
  }

  public keywords() {
    return this.getKeywords().map(key => toProperCase(key) + ' - ' + keywordsDefs.get(toProperCase(key))).join(' \n\n ');
  }

  public tooltipClass = {
    multiline: true
  }

  public getImage() {
    return 'assets/png/' + this.card.getImage();
  }

  public glowTypes = GlowType;
  public glowType() {
    if (this.selected)
      return GlowType.Select;
    if (this.card.isAttacking())
      return GlowType.Attack;
    if (this.card.isBlocking())
      return GlowType.Defense;
    if (this.target)
      return GlowType.Targeted;
    return GlowType.None;
  }


  public x() {
    return (this.hovered ? 1.9 : this.scale) * 100;
  }

  public y() {
    return (this.hovered ? 1.9 : this.scale) * 140;
  }

  ngOnInit() {
    if (!this.scale)
      this.scale = 1.25;
    this.overlay.registerCard(this.card.getId(), this.element);
    this.distFromMid = this.distFromMid || 0;

  }

}
