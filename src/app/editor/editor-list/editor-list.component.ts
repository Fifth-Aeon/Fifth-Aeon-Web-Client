import { Component, OnInit } from '@angular/core';
import { EditorDataService } from '../editor-data.service';
import { CardData, cardList } from '../../game_model/cards/cardList';

@Component({
  selector: 'ccg-editor-list',
  templateUrl: './editor-list.component.html',
  styleUrls: ['./editor-list.component.scss']
})
export class EditorListComponent implements OnInit {
  public cardList = cardList;

  constructor(public editorData: EditorDataService) { }

  public getEditLink(card: CardData) {
    return `/editor/card/${card.id}`;
  }

  public newCard() {
    this.editorData.createCard(prompt('Card Name'));
  }

  ngOnInit() {
  }

}
