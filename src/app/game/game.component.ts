import { Component, OnInit, HostListener } from '@angular/core';
import { remove } from 'lodash';

import { WebClient, ClientState } from '../client';
import { Game } from '../game_model/game';
import { Player } from '../game_model/player';


@Component({
  selector: 'bsc-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  public game: Game;
  public player: Player;
  public enemy: Player;

  constructor(public client: WebClient) {
    this.game = client.getGame();
    this.player = this.game.getPlayer(client.getPlayerdata().me);
    this.enemy = this.game.getPlayer(client.getPlayerdata().op);
    console.log(this.player, this.enemy);
  }

  @HostListener('window:beforeunload')
  public exit() {
    this.client.exitGame();
    return null;
  }

  ngOnInit() {
  }

}
