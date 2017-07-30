import { Component, OnInit, HostListener } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig, MdIconRegistry } from '@angular/material';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { remove } from 'lodash';

import { CardChooserComponent } from '../card-chooser/card-chooser.component';
import { WebClient, ClientState } from '../client';
import { Game, GamePhase } from '../game_model/game';
import { Player } from '../game_model/player';
import { Card } from '../game_model/card';
import { Unit } from '../game_model/unit';


@Component({
  selector: 'ccg-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  entryComponents: [CardChooserComponent]
})
export class GameComponent implements OnInit {
  public game: Game;
  public player: Player;
  public playerNo: number;
  public enemy: Player;
  public enemyNo: number;

  constructor(public client: WebClient, public dialog: MdDialog, registry: MdIconRegistry, sanitizer: DomSanitizer) {
    let url = sanitizer.bypassSecurityTrustResourceUrl('assets/svg/tombstone.svg');
    registry.addSvgIconInNamespace('ccg', 'tombstone', url);
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

  openCardChooser(cards: Array<Card>, toPick: number = 1) {
    let config = new MdDialogConfig();
    config.disableClose = true;
    let dialogRef = this.dialog.open(CardChooserComponent, config);
    dialogRef.componentInstance.cards = cards;
    dialogRef.componentInstance.numberToPick = toPick;
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }

  viewCrypt(player: number) {
    this.openCardChooser(this.game.getCrypt(player), 0);
  }

  ngOnInit() {
  }

  public canPlayResource() {
    return this.game.getCurrentPlayer() == this.player &&
      this.game.getCurrentPlayer().canPlayResource();
  }



  public getPassText(): string {
    if (this.game.isPlayerTurn(this.playerNo)) {
      if (this.game.isAttacking()) {
        if (this.game.isActivePlayer(this.playerNo))
          return 'Attack';
        else
          return 'Waiting';
      }
      return 'End Turn';
    } else {
      if (this.game.isActivePlayer(this.playerNo))
        return 'Done Blocking'
      return 'Enemy Turn';
    }
  }

  selected: Card = null;
  public select(card: Card) {
    if (!card.isPlayable(this.game))
      return;
    let targeter = card.getTargeter();
    if (!targeter.needsInput()) {
      this.client.playCard(card);
      this.selected = null;
    } else {
      this.selected = card;
    }
  }

  public target(card: Card) {
    let target = card as Unit;
    let phase = this.game.getPhase();
    if (!this.game.isPlayerTurn(this.playerNo) && phase == GamePhase.combat && this.blocker) {
      this.client.declareBlocker(this.blocker, target);
      this.blocker = null;
    } else if (this.selected && this.game.isPlayerTurn(this.playerNo) && (phase == GamePhase.play1 || phase == GamePhase.play2)) {
      this.client.playCard(this.selected, target);
      this.selected = null;
    }
  }

  public blocker: Unit;
  public activate(card: Card) {
    let unit = card as Unit;
    let phase = this.game.getPhase();
    if (this.game.isPlayerTurn(this.playerNo) && phase == GamePhase.play1) {
      if (!this.game.playerCanAttack(this.playerNo) && unit.canAttack())
        return;
      unit.toggleAttacking();
      this.client.toggleAttacker(unit.getId());
    } else if (!this.game.isPlayerTurn(this.playerNo) && phase == GamePhase.combat) {
      this.blocker = unit;
    }
  }

  public endTurn() {
    this.selected = null;
    this.client.pass();
  }

}
