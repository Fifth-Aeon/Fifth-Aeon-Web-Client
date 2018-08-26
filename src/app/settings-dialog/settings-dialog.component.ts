import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { SpeedService } from 'app/speed.service';
import { toPairs } from 'lodash';
import { CollectionService } from '../collection.service';
import { SoundManager, VolumeType } from '../sound';
import { TipService } from '../tips';

export enum SpeedSetting {
  Turtle = 0.5, Slow = 0.66, Normal = 1.0, Fast = 1.5, Ninja = 2
}

const speedNames: string[] = [];
for (let speed in SpeedSetting) {
  if (typeof SpeedSetting[speed] === 'number') speedNames.push(speed);
}


@Component({
  selector: 'ccg-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit {
  public volumes: [number, number][] = [];
  public volumeNames = VolumeType;
  public speedNames = speedNames;
  public speedSettings = SpeedSetting;


  constructor(
    public dialogRef: MatDialogRef<SettingsDialogComponent>,
    public sound: SoundManager,
    public tips: TipService,
    public speed: SpeedService,
    public collection: CollectionService
  ) { }


  ngOnInit() {
    this.volumes = toPairs(this.sound.getVolumes()).map(pair => [parseInt(pair[0], 10), pair[1]]) as [number, number][];
  }

  public toggleTips() {
    this.tips.toggleDisable();
  }

  public tipMessage() {
    if (this.tips.isDisabled())
      return 'Tips are disabled.';
    return 'Tips are enabled.';
  }

}
