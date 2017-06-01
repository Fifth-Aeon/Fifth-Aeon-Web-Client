import { BattleshipGame, Direction, Point, ShipType, TileBelief } from './battleship';
import * as randomJs from 'random-js';
const rng = new randomJs();

export abstract class AI {
    constructor(protected playerNumber: number, protected game: BattleshipGame) { }

    public getPlacement(): { ship: ShipType, loc: Point, dir: Direction }[] {
        let res = [];
        for (let i = 0; i < 5; i++) {
            let dat = {
                ship: i,
                loc: new Point(rng.integer(0, 9), rng.integer(0, 9)),
                dir: rng.integer(0, 3)
            }
            if (this.game.placeShip(this.playerNumber, dat.ship, dat.loc, dat.dir)) {
                res.push(dat);
            } else {
                i--;
            }
        }
        return res;
    }

    abstract getTarget(): {}
}

export class RandomAI extends AI {
    private targets: Point[];
    constructor(playerNumber: number, game: BattleshipGame) {
        super(playerNumber, game);
        this.targets = [];
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                this.targets.push(new Point(i, j));
            }
        }
    }

    public getTarget(): Point {
        let idx = rng.integer(0, this.targets.length - 1);
        return this.targets.splice(idx, 1)[0];
    }
}

/*
export class HunterSeeker extends AI {
    constructor(playerNumber: number, game: BattleshipGame) {
        super(playerNumber, game);
    }

    public getTarget(): Point {
        let intel = this.game.getBeliefs(this.playerNumber);
        let priorityTargets = [];
        let secondaryTargets = [];

        for (let r = 0; r < intel.length; r++) {
            for (let c = 0; c < intel[r].length; c++) {
                switch(intel[r][c]) {
                    case TileBelief.Unknown:
                        secondaryTargets.push(TileBelief.Unknown)
                        break;
                    case TileBelief.Hit:
                        this.game.getAdjacent
                }
            }
        }
    }

}
*/