import { Component, OnInit, Input } from '@angular/core';
import { Game, SyncGameEvent, GameEventType } from '../game_model/game';
import { Card } from '../game_model/card';

@Component({
  selector: 'ccg-record-bar',
  templateUrl: './record-bar.component.html',
  styleUrls: ['./record-bar.component.css']
})
export class RecordBarComponent implements OnInit {

  @Input() game: Game;
  @Input() playerNo: number;

  constructor() { }
  
  ngOnInit() {}
  
  public getItems(arr: Array<any>) {
    return arr.slice(Math.max(arr.length - 10, 0)).reverse();
  }

  public getPlayEvents() {
    return this.game.getPlayerActions().filter(event => event.type == GameEventType.playCard);
  }

  public getCard(event: SyncGameEvent): Card {
    return this.game.getCardById(event.params.played.id);
  }

  public isEnemy(event: SyncGameEvent) {
    return event.params.playerNo != this.playerNo;
  }

  public getTip(event: SyncGameEvent): string {
    let name = this.isEnemy(event) ? 'Your opponent' : 'You';
    let card = this.getCard(event);
    let targetString = '';
    if (!card)
      return '';
    if (event.params.targetIds != null && event.params.targetIds.length > 0) {
      let targets = event.params.targetIds.map((id) => this.game.getCardById(id));
      targetString = ' targeting ' + targets.map(card => card ? card.getName() : 'unknown').join(' and ');
    }
    let effectString = card.isUnit() ? '' : ` It has the effect "${card.getText()}"`;
    return `${name} played ${card.getName()}${targetString}.` + effectString;
  }

  public getImage(card: Card) {
    if (!card)
      return '';
    return 'assets/png/' + card.getImage();
  }

 

}
