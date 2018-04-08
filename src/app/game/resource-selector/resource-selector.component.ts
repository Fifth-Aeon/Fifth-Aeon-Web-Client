import { Component, OnInit, Input } from '@angular/core';
import { WebClient } from '../../client';

import { HotkeysService, Hotkey } from 'angular2-hotkeys';


@Component({
  selector: 'ccg-resource-selector',
  templateUrl: './resource-selector.component.html',
  styleUrls: ['./resource-selector.component.css']
})
export class ResourceSelectorComponent implements OnInit {
  @Input() canPlayResource: boolean;

  private makeHotkey(key: string, resource: string) {
    this.hotkeys.add(new Hotkey(key, (event: KeyboardEvent): boolean => {
      this.playResource(resource);
      return false;
    }, [], 'Play ' + resource + ' resource.'));
  }

  constructor(private client: WebClient, private hotkeys: HotkeysService) {
    let resources = ['Growth', 'Synthesis', 'Decay', 'Renewal'];
    let keys = ['g', 's', 'd', 'r'];
    for (let i = 0; i < 4; i++) {
      this.makeHotkey(keys[i], resources[i]);
    }
  }


  public disableTip() {
    if (!this.canPlayResource)
      return 'You can\'t play a resource right now.';
  }

  public tip(msg: string) {
    if (!this.canPlayResource)
      return '';
    return msg;
  }

  playResource(type: string) {
    if (!this.canPlayResource)
      return;
    this.client.playResource(type);
  }

  ngOnInit() {
  }

}
