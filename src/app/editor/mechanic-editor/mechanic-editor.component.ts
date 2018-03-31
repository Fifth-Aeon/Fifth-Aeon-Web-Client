import { Component, OnInit, Input } from '@angular/core';
import { mechanicList, MechanicData } from '../../game_model/cards/mechanicList';
import { SpellData } from '../../game_model/cards/cardList';
import { Mechanic } from 'fifthaeon/mechanic';
import { triggerList } from 'fifthaeon/cards/triggerList';

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
      trigger: { id: 'PlayTrigger'}
    });
  }

  public delete(index: number) {
    this.card.mechanics.splice(index, 1);
  }

  public isTriggered(mechanic: MechanicData) {
    return mechanicList.isTriggered(mechanic);
  }

  public getTriggerIds() {
    return triggerList.getIds();
  }

}
