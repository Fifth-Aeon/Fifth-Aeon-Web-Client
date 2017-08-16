import { Component, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { toPairs } from 'lodash';
import { SoundManager, VolumeType } from '../sound';

@Component({
  selector: 'ccg-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit {
  public volumes: [string, number][] = [];
  public volumeNames = VolumeType;
  constructor(public dialogRef: MdDialogRef<SettingsDialogComponent>, public sound: SoundManager) {
  }

  ngOnInit() {
    this.volumes = toPairs(this.sound.getVolumes());
  }

}
