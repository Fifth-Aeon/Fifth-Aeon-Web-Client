import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { toPairs } from 'lodash';
import { SoundManager, VolumeType } from '../sound';
import { TipService } from '../tips';
import { WebClient } from 'app/client';
import { SpeedService } from 'app/speed.service';
import { CollectionService } from '../collection.service';

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

}
