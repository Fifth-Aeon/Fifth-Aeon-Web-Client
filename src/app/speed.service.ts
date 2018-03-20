import { Injectable } from '@angular/core';

export enum SpeedSetting {
  Slow = 0.75, normal = 1.25, Fast = 0.75
}

@Injectable()
export class SpeedService {
  private static localStorageKey = 'speed-settings';

  public speeds = {
    arrow: 2000,
    cardDeath: 3500,
    aiTick: 750
  };
  private baseSpeed = Object.assign({}, this.speeds);
  public multiplier = 1;

  constructor() {
    this.loadSettings();
  }


  public setMultiplier(multiplier: number) {
    this.multiplier = multiplier;
    this.saveSettings();
    for (let prop in this.speeds) {
      this.speeds[prop] = this.baseSpeed[prop] / multiplier;
    }
  }

  private saveSettings() {
    localStorage.setItem(SpeedService.localStorageKey, JSON.stringify({
      multiplier: this.multiplier
    }));
  }

  private loadSettings() {
    let settingData = localStorage.getItem(SpeedService.localStorageKey);
    if (settingData) {
      let savedSettings = JSON.parse(settingData);
      this.multiplier = savedSettings.multiplier;
    }
  }



}
