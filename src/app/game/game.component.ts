import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { WebClient } from '../client';
import { GameManager } from '../gameManager';
import { Card, CardType, GameZone } from '../game_model/card-types/card';
import { ClientGame } from '../game_model/clientGame';
import { Enchantment } from '../game_model/card-types/enchantment';
import { GamePhase } from '../game_model/game';
import { Item } from '../game_model/card-types/item';
import { Permanent } from '../game_model/card-types/permanent';
import { Player } from '../game_model/player';
import { Unit } from '../game_model/card-types/unit';
import { TipService, TipType } from '../tips';
import { CardChooserComponent } from './card-chooser/card-chooser.component';
import { OverlayService } from './overlay.service';

const deathFadeTime = OverlayService.arrowTimer + 200;

@Component({
    selector: 'ccg-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
    entryComponents: [CardChooserComponent],
    animations: [
        trigger('location', [
            state('void', style({ opacity: 0 })),
            transition(':enter', [
                animate(
                    '1.0s ease',
                    style({
                        opacity: 1
                    })
                )
            ]),
            transition(':leave', [
                animate(
                    deathFadeTime + 'ms ease',
                    style({
                        opacity: 0,
                        filter: 'brightness(0)'
                    })
                )
            ])
        ]),
        trigger('inHand', [
            state('void', style({ opacity: 0 })),
            transition(':enter', [
                animate(
                    '0.5s ease',
                    style({
                        opacity: 1
                    })
                )
            ]),
            transition(':leave', [
                animate(
                    '0.5s ease',
                    style({
                        opacity: 0
                    })
                )
            ])
        ])
    ]
})
export class GameComponent implements OnInit, OnDestroy {
    private host: Unit | undefined;
    public game: ClientGame;
    public player: Player;
    public playerNo: number;
    public enemy: Player;
    public enemyNo: number;
    public locations = GameZone;
    public selected: Card | null = null;
    public validTargets: Set<Unit> = new Set();
    public blockable: Set<Unit> = new Set();
    public blocker: Unit | undefined;

    private hotkeys = [
        new Hotkey(
            'space',
            (event: KeyboardEvent): boolean => {
                this.pass();
                return false;
            },
            [],
            'Pass'
        ),
        new Hotkey(
            'a',
            (event: KeyboardEvent): boolean => {
                this.gameManager.attackWithAll();
                return false;
            },
            [],
            'Attack with all'
        )
    ];

    constructor(
        public client: WebClient,
        public dialog: MatDialog,
        private hotkeyService: HotkeysService,
        public overlay: OverlayService,
        private tips: TipService,
        public gameManager: GameManager
    ) {
        const game = gameManager.getGame();
        if (!game) {
            throw new Error(
                'Cannot initlize game component, game not in progress'
            );
        }
        this.game = game;
        this.overlay.setGame(this.game);
        this.playerNo = gameManager.getPlayerData().me;
        this.enemyNo = gameManager.getPlayerData().op;
        this.player = this.game.getPlayer(this.playerNo);
        this.enemy = this.game.getPlayer(this.enemyNo);

        if (this.gameManager.isInputEnabled()) {
            this.game.promptCardChoice = this.openCardChooser.bind(this);
        }

        this.addHotkeys();
    }

    public ngOnInit() {
        this.overlay.registerUIElement('player', 'player-name');
        this.overlay.registerUIElement('enemy', 'enemy-name');
    }

    public ngOnDestroy() {
        this.removeHotkeys();
        this.client.exitGame(false);
    }

    @HostListener('window:beforeunload')
    public exit() {
        this.client.exitGame(true);
        return null;
    }

    public openMenu() {
        this.client.openSettings();
    }

    public isInHand(card: Card) {
        return card.getLocation() === GameZone.Hand ? 'in' : 'notIn';
    }

    public locationState(card: Card) {
        return GameZone[card.getLocation()];
    }

    private addHotkeys() {
        for (const hotkey of this.hotkeys) {
            this.hotkeyService.add(hotkey);
        }
    }

    private removeHotkeys() {
        for (const hotkey of this.hotkeys) {
            this.hotkeyService.remove(hotkey);
        }
    }

    public pass() {
        if (this.passDisabled()) {
            return;
        }
        this.clear();
        this.game.pass();
    }

    public openCardChooser(
        player: number,
        cards: Array<Card>,
        min: number = 1,
        max: number = 1,
        callback: ((cards: Card[]) => void) | null = null,
        message: string = ''
    ) {
        this.game.deferChoice(player, cards, min, max, callback);
        if (player !== this.playerNo) {
            return;
        }

        const config = new MatDialogConfig();
        config.disableClose = true;
        const dialogRef = this.dialog.open(CardChooserComponent, config);
        dialogRef.componentInstance.cards = cards;
        dialogRef.componentInstance.min = min;
        dialogRef.componentInstance.max = max;
        dialogRef.componentInstance.suffix = message;
        dialogRef.componentInstance.setPage();
        if (callback) {
            dialogRef.afterClosed().subscribe((result: Card[]) => {
                this.game.makeChoice(this.playerNo, result);
            });
        }
    }

    private isMyTurn(): boolean {
        const currentPlayer = this.game.getActivePlayer();
        return currentPlayer === this.playerNo;
    }
    public currPlayerName(): string {
        return this.isMyTurn() ? 'your' : 'your opponent\'s';
    }

    public phaseColor() {
        return this.isMyTurn() ? 'cornflowerblue' : 'crimson';
    }
    public phaseName() {
        switch (this.game.getPhase()) {
            case GamePhase.Play1:
                return 'first play phase';
            case GamePhase.Play2:
                return 'second play phase';
            case GamePhase.Block:
                return 'block phase';
            case GamePhase.DamageDistribution:
                return 'damage distribution phase';
            case GamePhase.End:
                return 'discard phase';
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
            case GamePhase.DamageDistribution:
                return 'block';
            case GamePhase.End:
                return 'discard';
            default:
                return 'play1';
        }
    }

    public viewCrypt(player: number) {
        this.openCardChooser(this.playerNo, this.game.getCrypt(player), 0);
    }

    public canPlayResource() {
        return (
            this.game.getCurrentPlayer() === this.player &&
            this.game.getCurrentPlayer().canPlayResource()
        );
    }

    public wouldEndTurn() {
        return (
            (this.game.isPlayerTurn(this.playerNo) &&
                (this.game.getPhase() === GamePhase.Play1 &&
                    !this.game.isAttacking())) ||
            this.game.getPhase() === GamePhase.Play2
        );
    }

    public passDisabled(): boolean {
        return (
            !this.game.isActivePlayer(this.playerNo) ||
            !this.game.canTakeAction() ||
            (this.wouldEndTurn() && this.canPlayResource())
        );
    }

    public getAreaScale(height: number, padding: number) {
        return (height - (17.5 - 10 + padding) * 2) / 140;
    }

    public getPassText(): string {
        if (!this.game.canTakeAction()) {
            return 'Waiting for Choice';
        }
        if (this.game.isPlayerTurn(this.playerNo)) {
            if (this.game.isAttacking()) {
                if (this.game.isActivePlayer(this.playerNo)) {
                    return 'Attack';
                } else {
                    return 'Waiting for Blocks';
                }
            }
            if (this.game) {
                if (this.canPlayResource()) {
                    return 'Play a Resource';
                }
                return 'End Turn';
            }
        } else {
            if (this.game.isActivePlayer(this.playerNo)) {
                return 'Done Blocking';
            }
            return 'Enemy Turn';
        }
        return 'Error';
    }

    private doestNotNeedTarget(card: Card): boolean {
        const targeter = card.getTargeter();
        if (card.getCardType() === CardType.Item && !this.host) {
            return false;
        }
        return (
            !targeter.needsInput() ||
            (this.selected === card && targeter.isOptional())
        );
    }

    public select(card: Card) {
        if (!card.isPlayable(this.game)) {
            this.tips.cannotPlayTip(this.playerNo, this.game, card);
            return;
        }

        if (this.doestNotNeedTarget(card)) {
            this.game.playCardExtern(card, []);
            this.clear();
        } else {
            this.setSelected(card);
        }
    }

    private setSelected(card: Card) {
        const targeter = card.getTargeter();
        this.selected = card;
        if (card instanceof Item && this.host === undefined) {
            this.validTargets = new Set(
                card.getHostTargeter().getValidTargets(card, this.game)
            );
            return;
        }
        this.validTargets = new Set(targeter.getValidTargets(card, this.game));
        if (targeter.isOptional()) {
            this.tips.playTip(TipType.OptionalTarget);
        } else {
            this.tips.playTip(TipType.NeedsTarget);
        }
    }

    public setHost(host: Unit) {
        this.host = host;
        if (!this.selected) {
            throw new Error('Selected must be defined');
        }
        if (this.doestNotNeedTarget(this.selected)) {
            this.game.playCardExtern(this.selected, [], this.host);
            this.clear();
            return;
        }
        this.setSelected(this.selected);
    }

    public playTargeting(target: Unit) {
        if (!this.selected) {
            throw new Error('Selected must be defined');
        }
        console.log('play', this.selected, 'targeting', target);
        this.game.playCardExtern(this.selected, [target], this.host);
        this.clear();
    }

    public canPlayTargeting(target: Unit) {
        return (
            this.selected &&
            this.validTargets.has(target) &&
            this.game.isPlayerTurn(this.playerNo) &&
            (this.game.getPhase() === GamePhase.Play1 ||
                this.game.getPhase() === GamePhase.Play2)
        );
    }

    public isDarkened(perm: Permanent) {
        return perm instanceof Unit && perm.isExhausted();
    }

    private clear() {
        this.selected = null;
        this.host = undefined;
        this.blocker = undefined;
        this.validTargets = new Set();
        this.blockable = new Set();
    }

    private empowerDiminish(enchantment: Enchantment) {
        if (enchantment.canChangePower(this.player, this.game)) {
            this.game.modifyEnchantment(this.player, enchantment);
        } else {
            this.tips.cannotModifyEnchantment(
                this.player,
                this.game,
                enchantment
            );
        }
    }

    // Click friendly enemy Permanent
    public target(card: Card) {
        if (card.getCardType() === CardType.Enchantment) {
            this.empowerDiminish(card as Enchantment);
            return;
        }
        const target = card as Unit;
        const phase = this.game.getPhase();
        if (
            !this.game.isPlayerTurn(this.playerNo) &&
            phase === GamePhase.Block &&
            this.blocker
        ) {
            if (this.blocker.canBlockTarget(target)) {
                this.game.declareBlocker(this.blocker, target);
                this.clear();
            } else {
                this.tips.cannotBlockTargetTip(this.blocker, target, this.game);
            }
        } else if (this.canPlayTargeting(target)) {
            this.playTargeting(target);
        }
    }

    private setBlocker(blocker: Unit) {
        this.blocker = blocker;
        this.blockable = new Set(
            this.game
                .getAttackers()
                .filter(attacker => blocker.canBlockTarget(attacker))
        );
    }

    public isTarget(unit: Unit) {
        return this.validTargets.has(unit) || this.blockable.has(unit);
    }

    // Click friendly permanent
    public activate(card: Card) {
        if (card.getCardType() === CardType.Enchantment) {
            this.empowerDiminish(card as Enchantment);
            return;
        }
        const unit = card as Unit;
        const phase = this.game.getPhase();
        if (this.selected && this.canPlayTargeting(unit)) {
            if (this.selected.getCardType() === CardType.Item && !this.host) {
                this.setHost(unit);
            } else {
                this.playTargeting(unit);
            }
        } else if (this.game.isPlayerTurn(this.playerNo)) {
            if (phase === GamePhase.Play1) {
                if (
                    !(
                        this.game.playerCanAttack(this.playerNo) &&
                        unit.canAttack()
                    )
                ) {
                    this.tips.cannotAttackTip(unit, this.game);
                    return;
                }
                this.game.declareAttacker(unit);
            } else {
                this.tips.announce(
                    'You may only attack once each turn. All units attack at the same time.'
                );
            }
        } else if (
            !this.game.isPlayerTurn(this.playerNo) &&
            phase === GamePhase.Block
        ) {
            if (this.blocker === unit) {
                this.game.declareBlocker(unit, null);
                this.clear();
            } else if (unit.canBlock()) {
                this.setBlocker(unit);
            } else {
                this.tips.cannotBlockTip(unit, this.game);
            }
        }
    }
}
