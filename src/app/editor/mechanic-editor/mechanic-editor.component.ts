import { Component, OnInit, Input } from '@angular/core';
import { mechanicList, MechanicData } from '../../game_model/cards/mechanicList';
import { SpellData } from '../../game_model/cards/cardList';
import { Mechanic } from 'fifthaeon/mechanic';
import { triggerList } from 'fifthaeon/cards/triggerList';
import { targeterList } from 'fifthaeon/cards/targeterList';

@Component({
  selector: 'ccg-mechanic-editor',
  templateUrl: './mechanic-editor.component.html',
  styleUrls: ['./mechanic-editor.component.scss']
})
export class MechanicEditorComponent {

  public mechanicList = mechanicList;
  public mechanics;
  @Input() public card: SpellData;

  constructor() {
    // this.mechanics = this.mechanicList.getConstructors(this.card.cardType);
  }

  public add() {
    let validMechanics = mechanicList.getConstructors(this.card.cardType);
    if (validMechanics.length === 0)
      return;
    this.card.mechanics.push({
      id: validMechanics[0].getId(),
      parameters: [],
      trigger: { id: 'PlayTrigger'},
      targeter: { id: 'Host', optional: false}
    });
  }

  public delete(index: number) {
    this.card.mechanics.splice(index, 1);
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

}
