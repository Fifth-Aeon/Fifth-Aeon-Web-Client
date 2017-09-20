import { Injectable } from '@angular/core';

import { SoundManager } from './sound';
import { MdSnackBar } from '@angular/material';

import { Game } from './game_model/game';
import { Card } from './game_model/card';
import { Unit } from './game_model/unit';


export enum TipType {
    StartGame, FirstTurn, CanAttack, CanBlock, EndTurn, PlayedUnit, HasPlayable, OptionalTarget, NeedsTarget
}

const tipText = new Map<TipType, string>();
tipText.set(TipType.StartGame, 'Welcome newcomer. I will provide tips to help you learn to play.');
tipText.set(TipType.FirstTurn, `It is your turn. You can play a resource by clicking one of the four icons on the left side of your information bar. Try to match the resource you play to the symbols on the cards in your hand.`);
tipText.set(TipType.EndTurn, `After you play a resource you can end your turn by pressing the pass button on the right side of your information bar.`);
tipText.set(TipType.HasPlayable, `You have a playable card in your hand. Playable card are brighter and can be played by clicking them.`);
tipText.set(TipType.PlayedUnit, `Units can be used to attack your opponent, but not the turn they are played. Attacking allows you to damage your opponent. When they run out of life, you win.`);
tipText.set(TipType.CanAttack, `You can declare units as attackers by selecting them. All your units attack at once. Attackers that are not blocked will damage your opponent.`);
tipText.set(TipType.CanBlock, `You can block your opponent’s attackers by selecting one of your units then clicking the attacker you wish to block. The attacker will then fight your blocker, rather than damaging you. You can block a single attacker with multiple units.`);
tipText.set(TipType.OptionalTarget, `This card has an optional targeted ability. Valid targets have a blue glow. Alternatively, you can click the card again to play it without a target.`);
tipText.set(TipType.NeedsTarget, `This card requires a target. Valid targets have a blue glow.`);

const tipLocalStore = 'tip-store';

@Injectable()
export class TipService {
    private played: any;

    constructor(private soundManager: SoundManager, private snackbar: MdSnackBar) {
        let storedData = localStorage.getItem(tipLocalStore);
        if (storedData) {
            this.played = JSON.parse(storedData);
        } else {
            this.played = {};
        }
    }

    private lastMsg: string;
    public announce(text: string) {
        if (text === this.lastMsg)
            return
        this.lastMsg = text;
        this.snackbar.open(text, '', {
            duration: text.length * 75
        });
        this.soundManager.speak(text);
    }

    public playTip(tip: TipType): boolean {
        if (this.played[tip])
            return false;
        this.announce(tipText.get(tip));
        this.played[tip] = true;
        localStorage.setItem(tipLocalStore, JSON.stringify(this.played));
        return true;
    }

    public playResourceTrigger(game: Game, playerNo: number) {
        if (game.getCurrentPlayer().getPlayerNumber() != playerNo)
            return;
        let playable = game.getPlayer(playerNo).getHand().filter(card => card.isPlayable(game));
        if (playable.length > 0) {
            this.playTip(TipType.HasPlayable);
        } else {
            this.playTip(TipType.EndTurn);
        }
    }

    public playCardTrigger(card: Card, game: Game) {
        if (card.isUnit()) {
            this.playTip(TipType.PlayedUnit);
        } else
            this.playTip(TipType.EndTurn);
    }


    public turnStartTrigger(game: Game, playerNo: number) {
        if (game.getCurrentPlayer().getPlayerNumber() != playerNo)
            return;
        let hasAttacker = game.getBoard().getPlayerUnits(playerNo).filter(unit => unit.canAttack()).length > 0;
        if (hasAttacker)
            this.playTip(TipType.CanAttack);
        else
            this.playTip(TipType.FirstTurn);
    }

    public blockPhaseTrigger(game: Game, playerNo: number) {
        if (game.isActivePlayer(playerNo))
            this.playTip(TipType.CanBlock);
    }

    public cannotAttackTip(unit: Unit, game: Game) {
        if (!unit.isReady())
            this.announce('Units cannot attack the turn they are played.');
        else if (unit.isExausted())
            this.announce('Exausted units cannot attack.');
        else if (!game.canTakeAction())
            this.announce('You must wait for a choice to be made.');
        else
            this.announce('That unit cannot attack due to a special effect');
    }

    public cannotPlayTip(playerNo: number, game: Game, card: Card) {
        let player = game.getPlayer(playerNo);
        if (game.getCurrentPlayer().getPlayerNumber() != playerNo) {
            this.announce(`You can only play cards on your own turn.`);
        } else if (!player.getPool().meetsReq(card.getCost())) {
            let diff = card.getCost().difference(player.getPool());
            this.announce(`You need ${diff.map(diff => diff.diff + ' more ' + diff.name).join(' and ')} to play ${
                card.getName().replace(/\./g, '')}.`);
        } else if (card.isUnit() && !game.getBoard().canPlayUnit(card as Unit)) {
            this.announce(`Your board is too full to play a unit.`);
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
        for (let i = 0; i < 8; i++) {
            this.played[i] = true;
        }
        localStorage.setItem(tipLocalStore, JSON.stringify(this.played));
    }

}
