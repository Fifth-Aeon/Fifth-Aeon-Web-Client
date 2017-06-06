import { BattleshipGame, Direction, GameActionType, GameAction, GameEvent, GameEventType, Point, ShipType, shipSizes, TileBelief } from './battleship';
import * as randomJs from 'random-js';
import { minBy, sample } from 'lodash';
const rng = new randomJs();


export enum AiDifficulty {
    Easy, Medium, Hard
}

export abstract class AI {
    constructor(
        protected playerNumber: number,
        protected game: BattleshipGame,
        protected delay: (cb: () => void) => void,
        protected runGameAction: (type: GameActionType, params: any) => void
    ) { }

    public start() {
        this.placeShipsRandomly();
    }

    public handleGameEvent(event: GameEvent) {
        this.game.syncServerEvent(this.playerNumber, event);
        if (this.game.getTurn() != this.playerNumber)
            return;

        this.delayedFire(this.getTarget());
    }

    abstract getTarget(): Point;

    protected delayedFire(target: Point) {
        this.delay(() => {
            this.runGameAction(GameActionType.Fire, {
                target: target
            });
        });
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

    public start() {
        super.start();
        this.targets = [];
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                this.targets.push(new Point(i, j));
            }
        }
    }

    getTarget() {
        let idx = rng.integer(0, this.targets.length - 1);
        return this.targets.splice(idx, 1)[0];
    }
}


export class HunterSeeker extends AI {
    public start() {
        this.placeShipsRandomly();
    }

    public handleGameEvent(event: GameEvent) {
        super.handleGameEvent(event);
    }

    protected seek(targets: Point[]): Point {
        return sample(targets);
    }

    public getTarget(): Point {
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
            return sample(priorityTargets);
        return this.seek(secondaryTargets);
    }

}

export class ParityAI extends HunterSeeker {
    private shipCouldExistInDir(point: Point, size: number, dir: number): boolean {
        let grid = this.game.getBeliefs(this.playerNumber);
        let crawler = point.copy();
        for (let i = 0; i < size; i++) {
            crawler.moveInDirection(dir);
            if (!crawler.inBounds(0, 10, 0, 10) || grid[crawler.row][crawler.col] == TileBelief.Miss) {
                return false;
            } 
        }
        return true;
    }

    private shipCouldExistAtPoint(point: Point, ship: ShipType) {
        let len = shipSizes[ship] - 1;
        for (let dir = 0; dir < 4; dir++) {
            if (this.shipCouldExistInDir(point, ship, dir))
                return true;
        }
        return false;
    }

    protected seek(targets: Point[]): Point {
        let ships = this.game.getUnsunkShips()[this.game.getOpponent(this.playerNumber)];
        let smallest = minBy(ships, (ship) => shipSizes[ship]);
        let okTargets = targets.filter(point => this.shipCouldExistAtPoint(point, smallest));
        return sample(okTargets);
    }
}
