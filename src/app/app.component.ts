import { Component } from '@angular/core';
import { WebClient, ClientState } from './client';
import { SoundManager } from './sound';
import { Angulartics2GoogleTagManager  } from 'angulartics2';


@Component({
  selector: 'ccg-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public state = ClientState;
  constructor(public client: WebClient, public soundManager: SoundManager,
    tagManager: Angulartics2GoogleTagManager ) { }

  toggleMute() {
    this.soundManager.toggleMute();
  }
}
