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
import { Player } from '../game_model/player';
import { Card, Location } from '../game_model/card';
import { Unit } from '../game_model/unit';

//Deck Hand Board Crypt
@Component({
  selector: 'ccg-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  entryComponents: [CardChooserComponent],
  animations: [
    trigger('location', [
      state('void', style({ opacity: 0 })),
      transition('* => void', [
        animate('1.5s ease', style({
          opacity: 0,
          filter: 'brightness(0)',
        }))
      ]),
      transition('void => Board', [
        animate('1.0s ease', style({
          opacity: 1,
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
  public game: Game;
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
        tip.parentElement.remove()
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
    dialogRef.componentInstance.setPage();
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

  private whyUnplayable(card: Card): string {
    if (this.game.getCurrentPlayer().getPlayerNumber() != this.playerNo) {
      return `You can only play cards on your own turn.`;
    } else if (!this.player.getPool().meetsReq(card.getCost())) {
      let diff = card.getCost().difference(this.player.getPool());
      return `You need ${diff.map(diff => diff.diff + ' more ' + diff.name).join(' and ')} to play ${
        card.getName().replace(/\./g, '')}.`;
    } else if (card.isUnit() && !this.game.getBoard().canPlayUnit(card as Unit)) {
      return `Your board is too full to play a unit.`;
    } else {
      return `There are no valid targets for ${card.getName()}.`
    }
  }

  public selected: Card = null;
  public validTargets: Set<Unit> = new Set();
  public select(card: Card) {
    if (!card.isPlayable(this.game)) {
      this.tips.announce(this.whyUnplayable(card));
      return;
    }
    let targeter = card.getTargeter();
    if (!targeter.needsInput() || this.selected == card && targeter.optional()) {
      this.client.playCard(card, []);
      this.selected = null;
    } else {
      this.selected = card;
      let targeter = this.selected.getTargeter();
      this.validTargets = new Set(targeter.getValidTargets(card, this.game));
      if (targeter.optional())
        this.tips.playTip(TipType.OptionalTarget);
      else
        this.tips.playTip(TipType.NeedsTarget);

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

  private whyCantAttack(unit: Unit): string {
    if (!unit.isReady())
      return 'Units cannot attack the turn they are played.';
    if (unit.isExausted())
      return 'Exausted units cannot attack.';
    return 'That unit cannot attack due to a special effect';
  }

  public blocker: Unit;
  public activate(card: Card) {
    let unit = card as Unit;
    let phase = this.game.getPhase();
    if (this.canPlayTargeting(unit)) {
      this.playTargeting(unit);
    } else if (this.game.isPlayerTurn(this.playerNo)) {
      if (phase == GamePhase.play1) {
        if (!(this.game.playerCanAttack(this.playerNo) && unit.canAttack())) {
          this.tips.announce(this.whyCantAttack(unit));
          return;
        }
        this.client.toggleAttacker(unit);
      } else {
        this.tips.announce('You may only attack once each turn. All units attack at the same time.')
      }
    } else if (!this.game.isPlayerTurn(this.playerNo) && phase == GamePhase.combat) {
      if (this.blocker == unit) {
        this.client.declareBlocker(unit, null);
      } else {
        this.blocker = unit;
      }
    }
  }


}
