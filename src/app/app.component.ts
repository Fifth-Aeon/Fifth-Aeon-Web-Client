import { Component } from '@angular/core';
import { WebClient, ClientState } from './client';

@Component({
  selector: 'bsc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public state = ClientState;
  constructor(public client: WebClient) {

  }
}
