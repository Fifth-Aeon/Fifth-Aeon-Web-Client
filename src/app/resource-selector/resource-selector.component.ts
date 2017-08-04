import { Component, OnInit, Input } from '@angular/core';
import { WebClient } from '../client';

@Component({
  selector: 'ccg-resource-selector',
  templateUrl: './resource-selector.component.html',
  styleUrls: ['./resource-selector.component.css']
})
export class ResourceSelectorComponent implements OnInit {

  constructor(private client: WebClient) { }

  @Input() canPlayResource: boolean;

  public disableTip(){
    if (!this.canPlayResource) 
      return 'You can\'t play a resource right now.'
  }

  public tip(msg: string) {
    if (!this.canPlayResource) 
      return ''
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
