import { Component, OnInit, HostListener } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig, MdIconRegistry } from '@angular/material';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { remove } from 'lodash';

import { OverlayService } from '../overlay.service';
import { CardChooserComponent } from '../card-chooser/card-chooser.component';
import { WebClient, ClientState } from '../client';
import { Game, GamePhase } from '../game_model/game';
import { Player } from '../game_model/player';
import { Card } from '../game_model/card';
import { Unit } from '../game_model/unit';


@Component({
  selector: 'ccg-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  entryComponents: [CardChooserComponent]
})
export class GameComponent implements OnInit {
  public game: Game;
  public player: Player;
  public playerNo: number;
  public enemy: Player;
  public enemyNo: number;

  constructor(public client: WebClient, public dialog: MdDialog,
    private hotkeys: HotkeysService, public overlay:OverlayService) {
    this.game = client.getGame();
    this.player = this.game.getPlayer(client.getPlayerdata().me);
    this.enemy = this.game.getPlayer(client.getPlayerdata().op);
    this.playerNo = client.getPlayerdata().me;
    this.enemyNo = client.getPlayerdata().op;

    this.game.promptCardChoice = this.openCardChooser.bind(this);

    this.addHotkeys();
  }


  @HostListener('window:beforeunload')
  public exit() {
    this.client.exitGame();
    return null;
  }

  private addHotkeys() {
    this.hotkeys.add(new Hotkey('space', (event: KeyboardEvent): boolean => {
      this.pass();
      return false; // Prevent bubblingf
    }, [], 'Pass'));
    this.hotkeys.add(new Hotkey('a', (event: KeyboardEvent): boolean => {
      this.client.attackWithAll();
      return false; // Prevent bubblingf
    }, [], 'Attack with all'));
  }

  public pass() {
    if (this.passDisabled())
      return;
    this.selected = null;
    this.blocker = null;
    this.validTargets = new Set();
    this.client.pass();
  }

  public openCardChooser(player: number, cards: Array<Card>, toPick: number = 1, callback: (cards: Card[]) => void = null) {
    if (player != this.playerNo) {
      this.game.setDeferedChoice(callback);
      return;
    }
    let config = new MdDialogConfig();
    config.disableClose = true;
    let dialogRef = this.dialog.open(CardChooserComponent, config);
    dialogRef.componentInstance.cards = cards;
    dialogRef.componentInstance.numberToPick = toPick;
    dialogRef.afterClosed().subscribe(result => {
      if (callback) {
        callback(result);
        this.client.makeChoice(result);
      }
    });
  }

  public viewCrypt(player: number) {
    this.openCardChooser(this.playerNo, this.game.getCrypt(player), 0);
  }

  public ngOnInit() {
  }

  public canPlayResource() {
    return this.game.getCurrentPlayer() == this.player &&
      this.game.getCurrentPlayer().canPlayResource();
  }

  public wouldEndTurn() {
    return this.game.isPlayerTurn(this.playerNo) &&
      (this.game.getPhase() == GamePhase.play1 && !this.game.isAttacking()) ||
      (this.game.getPhase() == GamePhase.play2);
  }

  public passDisabled(): boolean {
    return !this.game.isActivePlayer(this.playerNo) ||
      (this.wouldEndTurn() && this.canPlayResource());
  }

  public getPassText(): string {
    if (this.game.isPlayerTurn(this.playerNo)) {
      if (this.game.isAttacking()) {
        if (this.game.isActivePlayer(this.playerNo))
          return 'Attack';
        else
          return 'Waiting';
      }
      if (this.game) {
        if (this.canPlayResource())
          return 'Play a Resource'
        return 'End Turn';
      }
    } else {
      if (this.game.isActivePlayer(this.playerNo))
        return 'Done Blocking'
      return 'Enemy Turn';
    }
  }

  public selected: Card = null;
  public validTargets: Set<Unit> = new Set();
  public select(card: Card) {
    if (!card.isPlayable(this.game))
      return;
    let targeter = card.getTargeter();
    if (!targeter.needsInput()) {
      this.client.playCard(card);
      this.selected = null;
    } else {
      this.selected = card;
      this.validTargets = new Set(this.selected.getTargeter().getValidTargets(card, this.game));
    }
  }

  public playTargeting(target: Unit) {
    this.client.playCard(this.selected, [target]);
    this.selected = null;
    this.validTargets = new Set();
  }

  public canPlayTargeting(target: Unit) {
    return this.selected && this.validTargets.has(target) &&
      this.game.isPlayerTurn(this.playerNo) &&
      (this.game.getPhase() == GamePhase.play1 || this.game.getPhase() == GamePhase.play2)
  }

  public target(card: Card) {
    let target = card as Unit;
    let phase = this.game.getPhase();
    if (!this.game.isPlayerTurn(this.playerNo) && phase == GamePhase.combat && this.blocker && this.blocker.canBlock(target)) {
      this.client.declareBlocker(this.blocker, target);
      this.blocker = null;
    } else if (this.canPlayTargeting(target)) {
      this.playTargeting(target);
    }
  }

  public blocker: Unit;
  public activate(card: Card) {
    let unit = card as Unit;
    let phase = this.game.getPhase();
    if (this.canPlayTargeting(unit)) {
      this.playTargeting(unit);
    } else if (this.game.isPlayerTurn(this.playerNo) && phase == GamePhase.play1) {
      if (!this.game.playerCanAttack(this.playerNo) && unit.canAttack())
        return;
      this.client.toggleAttacker(unit);
    } else if (!this.game.isPlayerTurn(this.playerNo) && phase == GamePhase.combat) {
      this.blocker = unit;
    }
  }


}
