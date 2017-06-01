import { Component, OnInit, HostListener } from '@angular/core';

import { ShipType, TileBelief, Direction, shipSizes, dirMappings, Point } from '../battleship';
import { WebClient, ClientState } from '../client';

@Component({
  selector: 'bsc-battleship-game',
  templateUrl: './battleship-game.component.html',
  styleUrls: ['./battleship-game.component.css']
})
export class BattleshipGameComponent implements OnInit {
  public nextShip: ShipType;
  public shipDir: Direction;
  public highlights: Set<String>;
  public placing: boolean = true;
  public state = ClientState;
  public beliefs = TileBelief;
  public shipLocs: Array<{ row: number, col: number, dir: Direction }> = [];
  public size = 30;
  public sizes = shipSizes;

  constructor(public client: WebClient) {
    this.nextShip = ShipType.Carrier;
    this.highlights = new Set();
  }

  @HostListener('window:beforeunload')
  public exit() {
    this.client.exitGame();
    return null;
  }

  public getSpriteUrl(ship: ShipType) {
    return 'assets/' + ShipType[ship].toLowerCase() + '.png'
  }

  public getState() {
    return this.client.getState();
  }

  public fire(row: number, col: number) {
    if (!this.client.canFire()) return;
    this.client.fire(row, col);
  }

  public getRot(dir: Direction): number {
    switch (dir) {
      case Direction.North:
        return 180;
      case Direction.East:
        return -90;
      case Direction.South:
        return 0;
      case Direction.West:
        return 90;
    }
  }

  public markedLocs = new Map<String, Direction>();
  public markOrigin: Point = null;
  public mark(row: number, col: number) {
    if (!this.placing)
      return;
    let clicked = new Point(row, col);
    if (this.markedLocs.has(clicked.toString())) {
      this.place(this.markOrigin.row, this.markOrigin.col, this.markedLocs.get(clicked.toString()));
      this.markOrigin = null;
      this.markedLocs.clear();
    } else {
      this.markedLocs.clear();
      this.markOrigin = clicked;
      for (let dir = 0; dir < 4; dir++) {
        if (!this.client.canPlaceShip(this.nextShip, clicked, dir))
          continue;
        let copy = clicked.copy();
        for (let i = 1; i < shipSizes[this.nextShip]; i++) {
          copy.moveInDirection(dir);
        }
        this.markedLocs.set(copy.toString(), dir);
      }
    }
  }

  public shipList(player: number) {
    let ships = this.client.getGame().getUnsunkShips()[player];
    return Array.from(ships).map(ship => ShipType[ship] + ' (' + shipSizes[ship] + ')').join(', ');
  }

  public place(row: number, col: number, dir: Direction) {
    console.log(row, col, Direction[dir]);
    if (!this.client.canPlace() || this.nextShip === 5) return;
    if (!this.client.place(row, col, this.nextShip, dir))
      return;
    this.nextShip++;
    this.shipLocs.push({ row: row, col: col, dir: dir });
    if (this.nextShip === 5) {
      this.client.finish();
      this.placing = false;
    }
  }

  public forces(cell: ShipType, row: number, col: number, opBelief: TileBelief) {
    return {
      'basic-cell': true,
      marked: this.markedLocs.has(`(${row}, ${col})`)
    }
  }

  ngOnInit() {
  }

}
