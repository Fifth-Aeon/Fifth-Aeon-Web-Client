import { Component, OnInit, Input } from '@angular/core';
import { mechanicList, MechanicData } from '../../game_model/cards/mechanicList';
import { SpellData } from '../../game_model/cards/cardList';

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
    this.card.mechanics.push({ id: 'flying' });
  }

  public delete(index: number) {
    this.card.mechanics.splice(index, 1);
  }




}
