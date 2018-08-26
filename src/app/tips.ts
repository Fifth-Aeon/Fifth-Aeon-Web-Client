import { Injectable } from '@angular/core';

import { SoundManager } from './sound';
import { MatSnackBar } from '@angular/material';

import { Game, GameSyncEvent, SyncEventType, GamePhase } from './game_model/game';
import { Card, CardType } from './game_model/card';
import { Player } from './game_model/player';
import { Unit } from './game_model/unit';
import { Item } from './game_model/item';
import { Enchantment } from './game_model/enchantment';
import { Unblockable, Flying, Aquatic } from './game_model/cards/mechanics/skills';



export enum TipType {
    StartGame, SelectDeck, EditDeck, Draft,
    FirstTurn, Mulligan,
    CanAttack, CanBlock, EndTurn,
    PlayedUnit, PlayedEnchantment,
    HasPlayable, OptionalTarget, NeedsTarget,
    SoftHandLimit, HardHandLimit,
    Hotkeys,
    TTLength
}

const tipText = new Map<TipType, string>();

// Out of game

tipText.set(TipType.SelectDeck,
    `You must select a deck before you can play a game. From this menu you can pick a starter deck, edit a deck, or make a new deck.`);
tipText.set(TipType.EditDeck,
    `From here you can edit your deck. Select a card to add it to your deck.
The cards currently in your deck are listed in the deck-list to the right.
You can also remove cards from your deck by selecting them from your deck-list.
A legal deck must have at least 40 cards and no more than 4 of a single type of card.
You can earn new cards by opening packs to expand your options.`);
tipText.set(TipType.Draft,
    `In draft mode you build a deck by selecting one of four cards repeatedly.
Try to pick cards that work well with each other, it is especially important to beware of resource costs.`);
tipText.set(TipType.Hotkeys,
    `Many game functions may be controlled through hotkeys. Press ? to list out the avalible commands.`);


// In Game
tipText.set(TipType.Mulligan,
    `At the start of the game you may replace any of the cards in your hand once.
I recommend you replace cards with high energy costs (the number at the top left of the card).`);
tipText.set(TipType.PlayedUnit,
    `Units can be used to attack your opponent, but not the turn they are played.
Attacking allows you to damage your opponent. When they run out of life, you win.`);
tipText.set(TipType.PlayedEnchantment,
    `Enchantments are continuous effects that modify the game. All enchantments have a certain amount of power.
When an enchantment runs of out of power, it is dispelled.
You may pay an enchantment’s empower cost to give it an extra point of power.
 Your opponent may also pay this cost to reduce your enchantments power by one.`);
tipText.set(TipType.HardHandLimit,
    `You have a hard hand size limit of twelve cards.
 If you would draw a card while you already have twelve cards in hand, it will be immediately discarded.`);
tipText.set(TipType.SoftHandLimit,
    `Your maximum hand size is eight cards. If you have more than eight you will be forced to discard them at the end of your turn.`);
tipText.set(TipType.FirstTurn,
    `It is your turn. You can play a resource by clicking one of the four icons on the left side of your information bar.
Try to match the resource you play to the symbols on the cards in your hand.`);
tipText.set(TipType.EndTurn,
    `After you play a resource you can end your turn by pressing the pass button on the right side of your information bar.`);
tipText.set(TipType.HasPlayable,
    `You have a playable card in your hand. Playable card are brighter and can be played by clicking them.`);
tipText.set(TipType.CanAttack,
    `You can declare units as attackers by selecting them. All your units attack at once.
Attackers that are not blocked will damage your opponent.`);
tipText.set(TipType.CanBlock,
    `You can block your opponent’s attackers by selecting one of your units then clicking the attacker you wish to block.
The attacker will then fight your blocker, rather than damaging you. You can block a single attacker with multiple units.`);
tipText.set(TipType.OptionalTarget,
    `This card has an optional targeted ability. Valid targets have a blue glow.
 Alternatively, you can click the card again to play it without a target.`);
tipText.set(TipType.NeedsTarget,
    `This card requires a target. Valid targets have a blue glow.`);

const tipLocalStore = 'tip-store';

@Injectable()
export class TipService {
    private played: any;
    private lastMsg: string;
    private username: string;

    constructor(private soundManager: SoundManager, private snackbar: MatSnackBar) {
        let storedData = localStorage.getItem(tipLocalStore);
        if (storedData) {
            this.played = JSON.parse(storedData);
        } else {
            this.played = {};
        }
    }

    public handleGameEvent(game: Game, localPlayerNumber: number, event: GameSyncEvent) {
        switch (event.type) {
            case SyncEventType.TurnStart:
                if (event.params.turn !== localPlayerNumber)
                    return;
                if (event.params.turnNum > 10)
                    this.playTip(TipType.Hotkeys);
                this.turnStartTrigger(game, localPlayerNumber);
                break;
            case SyncEventType.PhaseChange:
                if (event.params.phase === GamePhase.Block)
                    this.blockPhaseTrigger(game, localPlayerNumber);
                break;
            case SyncEventType.Draw:
                this.drawCardTrigger(game, localPlayerNumber, event.params.discarded);
                break;
            case SyncEventType.PlayResource:
                this.playResourceTrigger(game, localPlayerNumber);
                break;
            case SyncEventType.ChoiceMade:
                if (event.params.player === localPlayerNumber)
                    this.afterMulligan(game, localPlayerNumber);
                break;
        }

    }

    public setUsername(username: string) {
        this.username = username;
        tipText.set(TipType.StartGame,
            `Welcome ${username}. I will provide tips to help you learn to play.
            I suggest you start by playing a game against the computer.
            If you don't want tips you can disable them in the settings menu or with the hotkey shift t.`);
    }

    public announce(text: string) {
        if (text === this.lastMsg)
            return;
        this.lastMsg = text;
        this.snackbar.open(text, '', {
            duration: text.length * 75
        });
        this.soundManager.speak(text);
    }

    public playTip(tip: TipType): boolean {
        if (this.played[tip] || this.played.disabled)
            return false;
        this.announce(tipText.get(tip));
        this.played[tip] = true;
        localStorage.setItem(tipLocalStore, JSON.stringify(this.played));
        return true;
    }

    private playResourceTrigger(game: Game, playerNo: number) {
        if (game.getCurrentPlayer().getPlayerNumber() !== playerNo)
            return;
        let playable = game.getPlayer(playerNo).getHand().filter(card => card.isPlayable(game));
        if (playable.length > 0) {
            this.playTip(TipType.HasPlayable);
        } else {
            this.playTip(TipType.EndTurn);
        }
    }

    public playCardTrigger(card: Card, game: Game) {
        switch (card.getCardType()) {
            case CardType.Unit: this.playTip(TipType.PlayedUnit);
                break;
            case CardType.Enchantment: this.playTip(TipType.PlayedEnchantment);
                break;
        }
        if (card.isUnit()) {
        } else {
            this.playTip(TipType.EndTurn);
        }
    }

    private drawCardTrigger(game: Game, playerNo: number, discarded: boolean) {
        let cardCount = game.getPlayer(playerNo).getHand().length;

        if (discarded) {
            this.playTip(TipType.HardHandLimit);
        } else if (cardCount >= 8) {
            this.playTip(TipType.SoftHandLimit);
        }
    }


    private turnStartTrigger(game: Game, playerNo: number) {
        if (game.getCurrentPlayer().getPlayerNumber() !== playerNo)
            return;

        this.playTip(TipType.Mulligan);

    }

    private afterMulligan(game: Game, localPlayerNumber: number) {
        let hasAttacker = game.getBoard()
            .getPlayerUnits(localPlayerNumber)
            .filter(unit => unit.canAttack()).length > 0;

        if (hasAttacker)
            this.playTip(TipType.CanAttack);
        else
            this.playTip(TipType.FirstTurn);
    }

    private blockPhaseTrigger(game: Game, playerNo: number) {
        if (game.isActivePlayer(playerNo))
            this.playTip(TipType.CanBlock);
    }

    public cannotBlockTargetTip(blocker: Unit, attacker: Unit, game: Game) {
        if (!attacker.isAttacking())
            this.announce(`You can only block units that are currently attacking you.`);
        else if (attacker.hasMechanicWithId(Unblockable.getId()))
            this.announce(`${attacker.getName()} is unblockable.`);
        else if (attacker.hasMechanicWithId(Flying.getId()))
            this.announce(`Units with flying may only be blocked by other flying units or by ranged units.`);
        else if (attacker.hasMechanicWithId(Aquatic.getId()))
            this.announce(`Aquatic units may only be blocked by other aquatic units or by flying units.`);
        else if (blocker.hasMechanicWithId(Aquatic.getId()) && !attacker.hasMechanicWithId(Aquatic.getId()))
            this.announce(`Aquatic units may only block other aquatic units.`);
        else
            this.announce(`${blocker.getName()} cannot block ${attacker.getName()} due to a special effect.`);
    }

    public cannotBlockTip(blocker: Unit, game: Game) {
        if (blocker.isExausted())
            this.announce('Exhausted units can not block.');
        else
            this.announce('That unit can not block due to a special effect.');
    }

    public cannotAttackTip(unit: Unit, game: Game) {
        if (!unit.isReady())
            this.announce('Units cannot attack the turn they are played.');
        else if (unit.isExausted())
            this.announce('Exhausted units cannot attack.');
        else if (!game.canTakeAction())
            this.announce('You must wait for a choice to be made.');
        else
            this.announce('That unit cannot attack due to a special effect');
    }

    public cannotModifyEnchantment(player: Player, game: Game, enchantment: Enchantment) {
        let verb = enchantment.getOwner() === player.getPlayerNumber() ? 'empower' : 'diminish';
        if (player !== game.getCurrentPlayer())
            this.announce(`You can only ${verb} enchantments during your own turn.`);
        else if (!player.getPool().meetsReq(enchantment.getModifyCost()))
            this.announce(`You can not afford to ${verb} that enchantment.
                It would require ${enchantment.getModifyCost().getNumeric()} energy while you only have ${player.getPool().getNumeric()}.`);

    }

    public cannotPlayTip(playerNo: number, game: Game, card: Card) {
        let player = game.getPlayer(playerNo);
        if (game.getCurrentPlayer().getPlayerNumber() !== playerNo) {
            this.announce(`You can only play cards on your own turn.`);
        } else if (!player.getPool().meetsReq(card.getCost())) {
            let diff = card.getCost().difference(player.getPool());
            this.announce(`You need ${diff.map(change => change.diff + ' more ' + change.name).join(' and ')} to play ${
                card.getName().replace(/\./g, '')}.`);
        } else if (card.isUnit() && !game.getBoard().canPlayPermanant(card as Unit)) {
            this.announce(`Your board is too full to play a unit.`);
        } else if (card.getCardType() === CardType.Enchantment && !game.getBoard().canPlayPermanant(card as Enchantment)) {
            this.announce(`Your board is too full to play an enchantment.`);
        } else if (card.getCardType() === CardType.Item && !(card as Item).getHostTargeter().isTargetable(card, game)) {
            this.announce(`You don't have any units to attach that item to.`);
        } else if (!card.getTargeter().isTargetable(card, game)) {
            this.announce(`There are no valid targets for ${card.getName()}.`);
        } else {
            this.announce(`You must wait for a choice to be made.`);
        }
    }

    public markUnread() {
        this.played = {};
        localStorage.setItem(tipLocalStore, JSON.stringify(this.played));
    }

    public markRead() {
        for (let i = 0; i < TipType.TTLength; i++) {
            this.played[i] = true;
        }
        localStorage.setItem(tipLocalStore, JSON.stringify(this.played));
    }

    public toggleDisable() {
        this.played.disabled = !this.played.disabled;
        localStorage.setItem(tipLocalStore, JSON.stringify(this.played));
    }

    public isDisabled(): boolean {
        return this.played.disabled || false;
    }

}
