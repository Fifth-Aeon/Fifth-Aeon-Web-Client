import { Component, OnInit, HostListener } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig, MdIconRegistry } from '@angular/material';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { remove } from 'lodash';

import { OverlayService } from '../overlay.service';
import { TipService, TipType } from '../tips';
import { CardChooserComponent } from '../card-chooser/card-chooser.component';
import { WebClient, ClientState } from '../client';
import { Game, GamePhase } from '../game_model/game';
import { ClientGame } from '../game_model/clientGame';
import { Player } from '../game_model/player';
import { Card, CardType, Location } from '../game_model/card';
import { Unit } from '../game_model/unit';
import { Item } from '../game_model/item';
import { Targeter } from '../game_model/targeter';

const deathFadeTime = OverlayService.arrowTimer + 200;

//Deck Hand Board Crypt
@Component({
  selector: 'ccg-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  entryComponents: [CardChooserComponent],
  animations: [
    trigger('location', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        animate('1.0s ease', style({
          opacity: 1,
        }))
      ]),
      transition(':leave', [
        animate(deathFadeTime + 'ms ease', style({
          opacity: 0,
          filter: 'brightness(0)',
        }))
      ])
    ]),
    trigger('inHand', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        animate('0.5s ease', style({
          opacity: 1,
        }))
      ]),
      transition(':leave', [
        animate('0.5s ease', style({
          opacity: 0,
        }))
      ])
    ])
  ]
})
export class GameComponent implements OnInit {
  public game: ClientGame;
  public player: Player;
  public playerNo: number;
  public enemy: Player;
  public enemyNo: number;
  public locations = Location;

  constructor(public client: WebClient, public dialog: MdDialog,
    private hotkeys: HotkeysService, public overlay: OverlayService,
    private tips: TipService) {
    this.game = client.getGame();
    this.player = this.game.getPlayer(client.getPlayerdata().me);
    this.enemy = this.game.getPlayer(client.getPlayerdata().op);
    this.playerNo = client.getPlayerdata().me;
    this.enemyNo = client.getPlayerdata().op;

    this.game.promptCardChoice = this.openCardChooser.bind(this);

    // Workaround tooltip  not dissapering
    setInterval(() => {
      for (let tip of Array.from(document.getElementsByTagName('md-tooltip-component'))) {
        tip.parentElement.remove();
      }
    }, 30 * 1000);

    this.addHotkeys();
  }


  @HostListener('window:beforeunload')
  public exit() {
    this.client.exitGame();
    return null;
  }

  public isInHand(card: Card) {
    return card.getLocation() == Location.Hand ? 'in' : 'teal';
  }

  public locationState(card: Card) {
    return Location[card.getLocation()];
  }

  private addHotkeys() {
    this.hotkeys.add(new Hotkey('space', (event: KeyboardEvent): boolean => {
      this.pass();
      return false;
    }, [], 'Pass'));
    this.hotkeys.add(new Hotkey('a', (event: KeyboardEvent): boolean => {
      this.client.attackWithAll();
      return false;
    }, [], 'Attack with all'));
  }

  public pass() {
    if (this.passDisabled())
      return;
    this.clear();
    this.client.pass();
  }

  public openCardChooser(player: number, cards: Array<Card>, toPick: number = 1, callback: (cards: Card[]) => void = null, message: string = '') {
    this.game.setDeferedChoice(player, callback);
    if (player != this.playerNo)
      return;

    let config = new MdDialogConfig();
    config.disableClose = true;
    let dialogRef = this.dialog.open(CardChooserComponent, config);
    dialogRef.componentInstance.cards = cards;
    dialogRef.componentInstance.numberToPick = toPick;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.setPage();
    dialogRef.afterClosed().subscribe(result => {
      if (callback) {
        this.client.makeChoice(result);
      }
    });
  }


  private isMyTurn(): boolean {
    let currentPlayer = this.game.getActivePlayer();
    return (!currentPlayer || currentPlayer == this.playerNo)
  }
  public currPlayerName(): string {
    return this.isMyTurn() ?
      'your' : 'your opponent\'s';
  }

  public phaseColor() {
    return this.isMyTurn() ?
      'cornflowerblue' : 'crimson';
  }
  public phaseName(): string {
    switch (this.game.getPhase()) {
      case GamePhase.Play1:
        return 'first play phase';
      case GamePhase.Play2:
        return 'second play phase';
      case GamePhase.Block:
        return 'block phase';
      case GamePhase.End:
        return 'discard phase';
    }
  }

  public overlayCardPos(index: number) {
    return {
      left: 15 + (index * 10) + '%'
    }
  }

  public phaseImage() {
    switch (this.game.getPhase()) {
      case GamePhase.Play1:
        return 'play1';
      case GamePhase.Play2:
        return 'play2';
      case GamePhase.Block:
        return 'block';
      case GamePhase.End:
        return 'discard';
    }
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
      (this.game.getPhase() == GamePhase.Play1 && !this.game.isAttacking()) ||
      (this.game.getPhase() == GamePhase.Play2);
  }

  public passDisabled(): boolean {
    return !this.game.isActivePlayer(this.playerNo) ||
      !this.game.canTakeAction() ||
      (this.wouldEndTurn() && this.canPlayResource());
  }

  public getAreaScale(height: number, padding: number) {
    return (height - (17.5 - 10 + padding) * 2) / 140;
  }

  public getPassText(): string {
    if (!this.game.canTakeAction())
      return 'Waiting for Choice';
    if (this.game.isPlayerTurn(this.playerNo)) {
      if (this.game.isAttacking()) {
        if (this.game.isActivePlayer(this.playerNo))
          return 'Attack';
        else
          return 'Waiting for Blocks';;
      }
      if (this.game) {
        if (this.canPlayResource())
          return 'Play a Resource';
        return 'End Turn';
      }
    } else {
      if (this.game.isActivePlayer(this.playerNo))
        return 'Done Blocking';
      return 'Enemy Turn';
    }
  }

  private doestNotNeedTarget(card: Card): boolean {
    let targeter = card.getTargeter();
    if (card.getCardType() == CardType.Item && !this.host)
      return false;
    return !targeter.needsInput() || this.selected == card && targeter.isOptional()
  }


  public selected: Card = null;
  private targeters: Targeter[];
  public validTargets: Set<Unit> = new Set();

  public select(card: Card) {
    if (!card.isPlayable(this.game)) {
      this.tips.cannotPlayTip(this.playerNo, this.game, card);
      return;
    }

    let targeter = card.getTargeter();
    if (this.doestNotNeedTarget(card)) {
      this.client.playCard(card, []);
      this.clear();
    } else {
      this.setSelected(card);
    }
  }

  private host: Unit;
  private setSelected(card: Card) {
    let targeter = card.getTargeter();
    this.selected = card;
    if (card.getCardType() == CardType.Item && this.host == null) {
      let item = card as Item;
      this.validTargets = new Set(item.getHostTargeter().getValidTargets(card, this.game));
      return;
    }
    this.validTargets = new Set(targeter.getValidTargets(card, this.game));
    if (targeter.isOptional())
      this.tips.playTip(TipType.OptionalTarget);
    else
      this.tips.playTip(TipType.NeedsTarget);
  }

  public setHost(host: Unit) {
    let item = this.selected as Item;
    this.host = host;
    if (this.doestNotNeedTarget(this.selected)) {
      this.game.playCardExtern(this.selected, [], this.host);
      this.clear();
      return;
    }
    this.setSelected(this.selected);
  }

  public playTargeting(target: Unit) {
    this.game.playCardExtern(this.selected, [target], this.host);
    this.clear();
  }

  public canPlayTargeting(target: Unit) {
    return this.selected && this.validTargets.has(target) &&
      this.game.isPlayerTurn(this.playerNo) &&
      (this.game.getPhase() == GamePhase.Play1 || this.game.getPhase() == GamePhase.Play2);
  }

  private clear() {
    this.selected = null;
    this.host = null;
    this.validTargets = new Set();
    this.blocker = null;
  }

  public target(card: Card) {
    let target = card as Unit;
    let phase = this.game.getPhase();
    if (!this.game.isPlayerTurn(this.playerNo) && phase == GamePhase.Block && this.blocker) {
      if (this.blocker.canBlockTarget(target)) {
        this.client.declareBlocker(this.blocker, target);
        this.clear();
      } else {
        this.tips.cannotBlockTargetTip(this.blocker, target, this.game);
      }
    } else if (this.canPlayTargeting(target)) {
      this.playTargeting(target);
    }
  }

  public blocker: Unit;
  public activate(card: Card) {
    let unit = card as Unit;
    let phase = this.game.getPhase();
    if (this.canPlayTargeting(unit)) {
      if (this.selected.getCardType() == CardType.Item && this.host == null)
        this.setHost(unit);
      else
        this.playTargeting(unit);
    } else if (this.game.isPlayerTurn(this.playerNo)) {
      if (phase == GamePhase.Play1) {
        if (!(this.game.playerCanAttack(this.playerNo) && unit.canAttack())) {
          this.tips.cannotAttackTip(unit, this.game);
          return;
        }
        this.client.toggleAttacker(unit);
      } else {
        this.tips.announce('You may only attack once each turn. All units attack at the same time.');
      }
    } else if (!this.game.isPlayerTurn(this.playerNo) && phase == GamePhase.Block) {
      if (this.blocker == unit) {
        this.client.declareBlocker(unit, null);
        this.clear();
      } else if (unit.canBlock()) {
        this.blocker = unit;
      } else {
        this.tips.cannotBlockTip(unit, this.game);
      }
    }
  }

}
