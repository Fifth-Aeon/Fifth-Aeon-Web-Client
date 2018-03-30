import { Component, OnInit } from '@angular/core';
import { EditorDataService } from '../editor-data.service';
import { CardData } from 'fifthaeon/cards/cardList';

@Component({
  selector: 'ccg-editor-list',
  templateUrl: './editor-list.component.html',
  styleUrls: ['./editor-list.component.scss']
})
export class EditorListComponent implements OnInit {

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
