import { isComponentView } from '@angular/core/src/view/util';
import * as randomJs from 'random-js';
const rng = new randomJs();

export enum TileBelief {
    Unknown, Hit, Miss = -1
}

export enum ShipType {
    Carrier, Battleship, Cruiser, Submarine, Destroyer, None
}


export class Point {
    constructor(public row: number, public col: number) { }
    public add(other: Point) {
        this.row += other.row;
        this.col += other.col;
    }

    public moveInDirection(dir: Direction) {
        this.add(dirMappings[dir]);
    }

    public copy() {
        return new Point(this.row, this.col);
    }

    public inBounds(rowLow, rowHigh, colLow, colHigh): boolean {
        return this.row >= rowLow && this.row < rowHigh && this.col >= colLow && this.col < colHigh;
    }

    public toString() {
        return `(${this.row}, ${this.col})`;
    }
}

export interface GameAction {
    type: GameActionType,
    player: number,
    params: any
}

export enum GameActionType {
    PlaceShip, FinishPlacement, Fire, Quit
}

export enum GameEventType {
    Started, Fired, SunkShip, Ended
}

export class GameEvent {
    constructor(public type: GameEventType, public params: any, public owner: number = null, public redact: any = null) { }
}

export enum Direction {
    North, East, South, West
}

export const shipSizes = [5, 4, 3, 3, 2];
export const dirMappings = [new Point(-1, 0), new Point(0, 1), new Point(1, 0), new Point(0, -1)];
const playerNum = 2;
const boardSize = 10;

export class BattleshipGame {
    public reality: ShipType[][][];
    public beliefs: TileBelief[][][];
    private unplacedPieces: ShipType[][];
    private readyPlayers: number;
    private gameStarted: boolean;
    private playerTurn: number;
    private actionHandelers: Map<GameActionType, (act: GameAction) => void>;
    private events: GameEvent[];
    private remainingHits: [number, number];
    private hitsPerShip: [number[], number[]];
    private unsunkShips: [Set<ShipType>, Set<ShipType>];
    private playerReady: [boolean, boolean];
    private winner: number = -1;

    constructor(private errorHandeler: (player: number, msg: string) => void) {
        this.reality = [];
        this.beliefs = [];
        for (let i = 0; i < playerNum; i++) {
            this.reality.push(this.makeBoard(ShipType.None) as ShipType[][]);
            this.beliefs.push(this.makeBoard(TileBelief.Unknown) as TileBelief[][]);
        }
        let totalHits = shipSizes.reduce((a, b) => a + b);
        this.remainingHits = [totalHits, totalHits];
        this.hitsPerShip = [shipSizes.slice(), shipSizes.slice()];
        this.playerReady = [false, false];
        this.unplacedPieces = [
            [ShipType.Carrier, ShipType.Battleship, ShipType.Cruiser, ShipType.Submarine, ShipType.Destroyer],
            [ShipType.Carrier, ShipType.Battleship, ShipType.Cruiser, ShipType.Submarine, ShipType.Destroyer]
        ]
        this.readyPlayers = 0;
        this.gameStarted = false;
        this.playerTurn = 0;

        this.actionHandelers = new Map<GameActionType, (act: GameAction) => void>();
        this.events = [];

        this.unsunkShips = [
            new Set([ShipType.Battleship, ShipType.Carrier, ShipType.Cruiser, ShipType.Destroyer, ShipType.Submarine]),
            new Set([ShipType.Battleship, ShipType.Carrier, ShipType.Cruiser, ShipType.Destroyer, ShipType.Submarine])
        ]

        this.addActionHandeler(GameActionType.PlaceShip, (act) => {
            this.placeShip(act.player, act.params.ship, new Point(act.params.loc.row, act.params.loc.col), act.params.dir)
        });
        this.addActionHandeler(GameActionType.FinishPlacement, (act) => {
            this.finishPlacement(act.player)
        });
        this.addActionHandeler(GameActionType.Fire, (act) => {
            this.fireAt(act.player, new Point(act.params.target.row, act.params.target.col))
        });
        this.addActionHandeler(GameActionType.Quit, (act) => {
            this.quit(act.player);
        })
    }

    private quit(player: number) {
        this.winner = this.getOpponent(player);
        this.addGameEvent(GameEventType.Ended, { winner: this.winner, quit:true });
    }

    private makeBoard(initial: TileBelief | ShipType): TileBelief[][] | ShipType[][] {
        let board = [];
        for (let j = 0; j < boardSize; j++) {
            board.push([]);
            for (let k = 0; k < boardSize; k++) {
                board[j].push(initial);
            }
        }
        return board;
    }

    public hasStarted() {
        return this.gameStarted;
    }

    public getTurn() {
        return this.playerTurn;
    }

    public getWinner() {
        return this.winner;
    }

    public getUnsunkShips() {
        return this.unsunkShips;
    }

    public syncServerEvent(owner: number, event: GameEvent) {
        switch (event.type) {
            case GameEventType.Started:
                this.playerTurn = event.params.turn
                this.gameStarted = true;
                break;
            case GameEventType.Fired:
                let params = event.params;
                let targetedPlayer = this.getOpponent(event.params.shooter);
                this.beliefs[event.params.shooter][params.target.row][params.target.col] =
                    params.hit ? TileBelief.Hit : TileBelief.Miss;
                this.playerTurn = params.nextPlayer;
                break;
            case GameEventType.SunkShip:
                this.unsunkShips[event.params.owner].delete(event.params.ship);
                break;
            case GameEventType.Ended:
                this.winner = event.params.winner;
                break;
        }
    }

    private addActionHandeler(type: GameActionType, cb: (act: GameAction) => void) {
        this.actionHandelers.set(type, cb.bind(this));
    }

    private addGameEvent(type: GameEventType, params: any, owner: number = null, redact: any = null) {
        this.events.push(new GameEvent(type, params, owner, redact));
    }

    public handleAction(action: GameAction): GameEvent[] {
        let mark = this.events.length;
        let handeler = this.actionHandelers.get(action.type);
        if (!handeler)
            return [];
        let sig = handeler(action);
        return this.events.slice(mark);
    }

    private addError(player: number, message: string) {
        this.errorHandeler(player, message);
    }

    public getOpponent(player: number) {
        return (player + 1) % playerNum;
    }

    private nextTurn() {
        this.playerTurn = this.getOpponent(this.playerTurn);
    }

    public getBeliefs(player: number) {
        return this.beliefs[player];
    }

    public fireAt(shootingPlayer: number, target: Point) {
        // Error checking
        if (!this.gameStarted) {
            this.addError(shootingPlayer, 'The game has not started yet.')
            return;
        }
        if (this.playerTurn != shootingPlayer) {
            this.addError(shootingPlayer, 'It is not your turn.')
            return;
        }
        if (!target.inBounds(0, 10, 0, 10)) {
            this.addError(shootingPlayer, 'Target out of bounds.')
            return;
        }
        if (this.beliefs[shootingPlayer][target.row][target.col] != TileBelief.Unknown) {
            this.addError(shootingPlayer, 'You have already fired at that location.')
            return;
        }
        let op = this.getOpponent(shootingPlayer);

        // Game Logic
        let board = this.reality[op];
        let ShipHit = board[target.row][target.col];
        let hit = ShipHit != ShipType.None;
        if (hit) {
            this.beliefs[shootingPlayer][target.row][target.col] = TileBelief.Hit;
            this.remainingHits[op]--;
            this.hitsPerShip[op][ShipHit]--;
        } else {
            this.beliefs[shootingPlayer][target.row][target.col] = TileBelief.Miss;
        }

        // Report results to players
        this.addGameEvent(GameEventType.Fired, {
            target: target,
            shooter: shootingPlayer,
            hit: hit,
            nextPlayer: op
        })

        // Check if ship sunk
        if (this.hitsPerShip[op][ShipHit] < 1) {
            this.addGameEvent(GameEventType.SunkShip, {
                owner: op,
                ship: ShipHit
            }, shootingPlayer, null)
        }

        // Check if the game ended
        if (this.remainingHits[op] < 1) {
            this.addGameEvent(GameEventType.Ended, {
                winner: shootingPlayer,
                quit: false
            }, shootingPlayer, null)
            this.winner = shootingPlayer;
            this.playerTurn = 3;
        }

        this.nextTurn();
    }

    public finishPlacement(player: number) {
        if (this.unplacedPieces[player].length > 0) {
            this.addError(player, 'You still have unplayed peices.')
            return;
        }
        if (this.playerReady[player])
            return;
        this.readyPlayers++;
        this.playerReady[player] = true;
        if (this.readyPlayers === playerNum) {
            this.gameStarted = true;
            this.playerTurn = rng.integer(0, 1);
            this.addGameEvent(GameEventType.Started, { turn: this.playerTurn });
        }
    }

    public placeShip(player: number, ship: ShipType, location: Point, dir: Direction) {
        if (!this.canPlaceShip(player, ship, location, dir))
            return false;
        let board = this.reality[player];
        let crawler = location.copy();
        for (let i = 0; i < shipSizes[ship]; i++) {
            board[crawler.row][crawler.col] = ship;
            crawler.moveInDirection(dir);
        }
        this.unplacedPieces[player].splice(this.unplacedPieces[player].indexOf(ship), 1);
        return true;
    }

    public canPlaceShip(player: number, ship: ShipType, location: Point, dir: Direction): boolean {
        if (this.unplacedPieces[player].indexOf(ship) === -1) {
            this.addError(player, 'You already placed a ' + ShipType[ship]);
            return false;
        }
        let board = this.reality[player];
        let crawler = location.copy();
        for (let i = 0; i < shipSizes[ship]; i++) {
            if (!board[crawler.row] || board[crawler.row][crawler.col] != ShipType.None) {
                return false;
            }
            crawler.moveInDirection(dir);
        }
        return true;
    }

    public boardToString<T>(board: Array<Array<T>>, formatCell: (T) => string) {
        return board.map(row => {
            row.map(formatCell).join('')
        }).join('\n');
    }


}