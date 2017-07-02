import { Component, OnInit } from '@angular/core';
import { WebClient } from '../client';

@Component({
  selector: 'ccg-resource-selector',
  templateUrl: './resource-selector.component.html',
  styleUrls: ['./resource-selector.component.css']
})
export class ResourceSelectorComponent implements OnInit {

  constructor(private client: WebClient) { }

  playResource(type: string) {
    if (!this.client.getGame().getCurrentPlayer().canPlayResource())
      return;
    this.client.playResource(type);
  }

  ngOnInit() {
  }

}
