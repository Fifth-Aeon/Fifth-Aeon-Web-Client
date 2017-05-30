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

  constructor(public client: WebClient) {
    this.nextShip = ShipType.Carrier;
    this.shipDir = Direction.East;
    this.highlights = new Set();
  }

  @HostListener('window:beforeunload')
  public exit() {
    this.client.exitGame();
    return null;
  }

  public getState() {
    return this.client.getState();
  }

  public fire(row: number, col: number) {
    if (!this.client.canFire()) return;
    this.client.fire(row, col);
  }

  public toggleDir() {
    if (this.shipDir == Direction.East)
      this.shipDir = Direction.South;
    else
      this.shipDir = Direction.East;
  }

  private currPoint = new Point(-100, -100);
  public hoverPreview(row: number, col: number) {
    if (!this.placing)
      return;
    this.highlights.clear();
    this.currPoint = new Point(row, col);
    let copy = this.currPoint.copy();
    for (let i = 0; i < shipSizes[this.nextShip]; i++) {
      this.highlights.add(copy.toString());
      copy.moveInDirection(this.shipDir);
    }
  }

  public isHighlighted(row: number, col: number) {
    return this.placing && this.highlights.has(new Point(row, col).toString());
  }

  public shipList(ships: Set<ShipType>) {
    return Array.from(ships).map(ship => ShipType[ship] + ' (' + shipSizes[ship] + ')').join(', ');
  }

  public place(row: number, col: number) {
    if (!this.client.canPlace() || this.nextShip === 5) return;
    if (this.client.place(row, col, this.nextShip, this.shipDir))
      this.nextShip++;
    if (this.nextShip === 5) {
      this.client.finish();
      this.placing = false;
    }
  }

  public intelStyle(cell: TileBelief) {
    return {
      hit: cell === TileBelief.Hit,
      miss: cell === TileBelief.Miss,
      unknown: cell === TileBelief.Unknown,
    }
  }

  public forces(cell: ShipType, row: number, col: number, opBelief: TileBelief) {
    return {
      occupied: cell !== ShipType.None,
      preview: this.isHighlighted(row, col),
      hit: opBelief == TileBelief.Hit,
      miss: opBelief == TileBelief.Miss
    }
  }

  ngOnInit() {
  }

}
