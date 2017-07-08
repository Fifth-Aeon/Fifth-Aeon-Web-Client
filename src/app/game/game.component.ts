import { Component, OnInit, HostListener } from '@angular/core';
import { remove } from 'lodash';

import { WebClient, ClientState } from '../client';
import { Game } from '../game_model/game';
import { Player } from '../game_model/player';
import { Card } from '../game_model/card';
import { Unit } from '../game_model/unit';


@Component({
  selector: 'ccg-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  public game: Game;
  public player: Player;
  public playerNo: number;
  public enemy: Player;
  public enemyNo: number;

  constructor(public client: WebClient) {
    this.game = client.getGame();
    this.player = this.game.getPlayer(client.getPlayerdata().me);
    this.enemy = this.game.getPlayer(client.getPlayerdata().op);
    this.playerNo = client.getPlayerdata().me;
    this.enemyNo = client.getPlayerdata().op;
  }

  @HostListener('window:beforeunload')
  public exit() {
    this.client.exitGame();
    return null;
  }

  ngOnInit() {
  }

  public select(card: Card) {
    if (!card.isPlayable(this.game))
      return;
    let targeter = card.getTargeter();
    if (!targeter.needsInput()) {
      this.client.playCard(card);
    }
  }

  public getPassText(): string {
    if (this.game.isPlayerTurn(this.playerNo)) {
      if (this.game.isAttacking())
        return 'Attack';
      return 'End Turn';
    } else {
      return 'Enemy Turn';
    }
  }

  public target(card: Card) {

  }

  public activate(card: Card) {
    let unit = card as Unit;
    unit.toggleAttacking();
    this.client.toggleAttacker(unit.getId());
  }

  public endTurn() {
    this.client.pass();
  }

}
