import { BattleshipGame, Direction, GameActionType, GameAction, GameEvent, GameEventType, Point, ShipType, TileBelief } from './battleship';
import * as randomJs from 'random-js';
const rng = new randomJs();

function pick<T>(arr: Array<T>): T {
    let idx = rng.integer(0, arr.length - 1);
    return arr[idx];
}

export enum AiDifficulty {
    Easy, Medium, Hard
}

export abstract class AI {
    constructor(
        protected playerNumber: number,
        protected game: BattleshipGame,
        protected runGameAction: (type: GameActionType, params: any) => void
    ) { }

    abstract handleGameEvent(event: GameEvent);

    abstract start();

    protected delayedFire(target: Point) {
        console.log('df');
        setTimeout(() => {
            console.log('f');
            this.runGameAction(GameActionType.Fire, {
                target: target
            });
        }, 3500);
    }

    protected placeShipsRandomly() {
        let locs = [];
        for (let i = 0; i < 5; i++) {
            let dat = {
                ship: i,
                loc: new Point(rng.integer(0, 9), rng.integer(0, 9)),
                dir: rng.integer(0, 3)
            }
            if (this.game.placeShip(this.playerNumber, dat.ship, dat.loc, dat.dir)) {
                locs.push(dat);
            } else {
                i--;
            }
        }
        for (let loc of locs) {
            this.runGameAction(GameActionType.PlaceShip, {
                ship: loc.ship,
                loc: loc.loc,
                dir: loc.dir
            });
        }
        this.runGameAction(GameActionType.FinishPlacement, {});
    }
}

export class RandomAI extends AI {
    private targets: Point[];

    constructor(playerNumber: number, game: BattleshipGame, runGameAction: (type: GameActionType, params: any) => void) {
        super(playerNumber, game, runGameAction);
        this.targets = [];
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                this.targets.push(new Point(i, j));
            }
        }
    }

    public start() {
        this.placeShipsRandomly();
    }

    public handleGameEvent(event: GameEvent) {
        this.game.syncServerEvent(this.playerNumber, event);
        if (this.game.getTurn() != this.playerNumber)
            return;
        let idx = rng.integer(0, this.targets.length - 1);
        let target = this.targets.splice(idx, 1)[0];
        this.delayedFire(target);
    }
}


export class HunterSeeker extends AI {
    public start() {
        this.placeShipsRandomly();
    }

    public handleGameEvent(event: GameEvent) {
        this.game.syncServerEvent(this.playerNumber, event);
        if (this.game.getTurn() != this.playerNumber)
            return;
        let target = this.getTarget();
        this.delayedFire(target);
    }

    private getTarget(): Point {
        let intel = this.game.getBeliefs(this.playerNumber);
        let priorityTargets: Point[] = [];
        let secondaryTargets: Point[] = [];

        for (let r = 0; r < intel.length; r++) {
            for (let c = 0; c < intel[r].length; c++) {
                let point = new Point(r, c);
                if (intel[r][c] == TileBelief.Unknown) {
                    let adjacent = point.getAdjacent(0, 10, 0, 10);
                    let toAdd = secondaryTargets;
                    for (let adj of adjacent) {
                        if (intel[adj.row][adj.col] == TileBelief.Hit) {
                            toAdd = priorityTargets;
                        }
                    }
                    toAdd.push(point);
                }
            }
        }

        if (priorityTargets.length > 0)
            return pick(priorityTargets);
        return pick(secondaryTargets);
    }

}

export class HeuristicAI extends AI {
    public start() {
        this.placeShipsRandomly();
    }

    public handleGameEvent(event: GameEvent) {
        this.game.syncServerEvent(this.playerNumber, event);
        if (this.game.getTurn() != this.playerNumber)
            return;
        let target = this.getTarget();
        this.delayedFire(target);
    }

    private getTarget(): Point {
        let intel = this.game.getBeliefs(this.playerNumber);
        let priorityTargets: Point[] = [];
        let secondaryTargets: Point[] = [];

        for (let r = 0; r < intel.length; r++) {
            for (let c = 0; c < intel[r].length; c++) {
                let point = new Point(r, c);
                if (intel[r][c] == TileBelief.Unknown) {
                    let adjacent = point.getAdjacent(0, 10, 0, 10);
                    let toAdd = secondaryTargets;
                    for (let adj of adjacent) {
                        if (intel[adj.row][adj.col] == TileBelief.Hit) {
                            toAdd = priorityTargets;
                        }
                    }
                    toAdd.push(point);
                }
            }
        }

        if (priorityTargets.length > 0)
            return pick(priorityTargets);
        return pick(secondaryTargets);
    }

}
