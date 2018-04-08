import { Component, OnInit } from '@angular/core';
import { UnitData, cardList, CardData } from '../../game_model/cards/cardList';
import { UnitType } from '../../game_model/unit';
import { Card, CardType } from '../../game_model/card';
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
  public previewCard: Card;
  public data: CardData;

  private lastCardType: CardType;

  constructor(
    route: ActivatedRoute,
    router: Router,
    editorData: EditorDataService
  ) {
    setInterval(() => this.refreshPreview(), 3000);
    route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.data = editorData.getCard(id);
      this.lastCardType = this.data.cardType;
      this.refreshPreview();
    });
  }

  public changeType(event: MatSelectChange) {
    console.log(CardType[this.lastCardType], '->', CardType[event.value]);
    this.data.mechanics = this.data.mechanics.filter(mechanic => mechanicList.isValid(this.data, mechanic));
  }

  public fileChange(event): void {
    let files: FileList = event.target.files;
    if (files.length === 0)
      return;
    const image = files.item(0);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.data.imageUrl = e.target.result;
    };
    reader.readAsDataURL(image);
  }

  public refreshPreview() {
    this.previewCard = cardList.buildInstance(this.data);
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
