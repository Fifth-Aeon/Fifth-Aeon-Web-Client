import { Component } from '@angular/core';
import { WebClient, ClientState } from './client';
import { SoundManager } from './sound';
import { Angulartics2GoogleAnalytics } from 'angulartics2';


@Component({
  selector: 'ccg-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public state = ClientState;
  constructor(public client: WebClient, public soundManager: SoundManager,
    angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) { }

  toggleMute() {
    this.soundManager.toggleMute();
  }
}
