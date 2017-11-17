import { Injectable } from '@angular/core';

export enum SpeedSetting {
  Slow = 0.75, normal = 1.25, Fast = 0.75
}

@Injectable()
export class SpeedService {
  public speeds = {
    arrow: 2000,
    cardDeath: 3500,
    aiTick: 750
  }
  private baseSpeed = Object.assign({}, this.speeds);
  public multiplier = 1;

  public setMultiplier(multiplier: number) {
    this.multiplier = multiplier;
    for (let prop in this.speeds) {
      this.speeds[prop] = this.baseSpeed[prop] / multiplier;
    }
  }


}
