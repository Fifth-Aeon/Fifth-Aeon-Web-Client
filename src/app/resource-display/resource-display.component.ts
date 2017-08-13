import { Component, OnInit, Input } from '@angular/core';
import { Resource } from '../game_model/resource';

@Component({
  selector: 'ccg-resource-display',
  templateUrl: './resource-display.component.html',
  styleUrls: ['./resource-display.component.scss']
})
export class ResourceDisplayComponent implements OnInit {
  @Input() resource: Resource;
  constructor() { }

  iconSize = 28;
  padding = 15;
  resourceTypes = [
    { name: 'Growth', icon: 'assets/png/growth.png' },
    { name: 'Synthesis', icon: 'assets/png/synthesis.png' },
    { name: 'Decay', icon: 'assets/png/decay-icon.png' },
    { name: 'Renewal', icon: 'assets/png/renewal.png' }
  ]

  ngOnInit() {
  }

}
