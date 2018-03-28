import { Component, OnInit } from '@angular/core';
import { UnitData, cardList } from '../../game_model/cards/cardList';
import { UnitType } from '../../game_model/unit';
import { Card, CardType } from '../../game_model/card';


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

  public data: UnitData = {

    name: '',
    id: '',
    imageUrl: '',
    cost: {
      energy: 0,
      synthesis: 0,
      growth: 0,
      decay: 0,
      renewal: 0
    },
    mechanics: [],
    targeter: { id: 'Untargeted' },
    cardType: CardType.Unit,
    life: 1,
    damage: 1,
    type: UnitType.Human
  };
  public previewCard  = cardList.buildUnitInstance(this.data);



  public refreshPreview() {
    this.previewCard = cardList.buildUnitInstance(this.data);
  }

  // Enforce resource requirments summing up to 6 (so it fits in UI)
  public getReqMax(resoureName: 'synthesis' | 'growth' | 'renewal' | 'decay') {
    let total = this.data.cost.renewal + this.data.cost.synthesis + this.data.cost.growth + this.data.cost.decay;
    return CardEditorComponent.MaxRequirementTotal - total + this.data.cost[resoureName];
  }

  public getKeys(enumeration) {
    return Object.keys(enumeration)
      .filter(key => !isNaN(parseInt(key, 10)))
      .map(key => parseInt(key, 10));
  }

  ngOnInit() {
  }

}
