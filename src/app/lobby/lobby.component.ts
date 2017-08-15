import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { WebClient, ClientState } from '../client';
import { AiDifficulty } from '../ai';
import { SoundManager } from '../sound';


@Component({
  selector: 'ccg-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  public state = ClientState;
  public difficulty: AiDifficulty = AiDifficulty.Easy;
  public diffs = AiDifficulty;

  constructor(private router: Router, public client: WebClient, public soundManager: SoundManager) {
    if (client.getState() != ClientState.UnAuth && client.getState() != ClientState.Waiting)
      client.returnToLobby();
  }

  public join() {
    this.client.join();
    //this.fullscreen();
  }

  public fullscreen() {
    let fsRequester: any = document.documentElement;
    if (fsRequester.mozRequestFullScreen) {
      fsRequester.mozRequestFullScreen();
    } else if (fsRequester.webkitRequestFullScreen) {
      fsRequester.webkitRequestFullScreen();
    } else if (fsRequester.requestFullscreen) {
      fsRequester.requestFullscreen();
    }
  }

  @HostListener('window:beforeunload')
  public exit() {
    if (this.client.getState() == ClientState.InQueue)
      this.client.leaveQueue();
    return null;
  }

  ngOnInit() { }

  public getState() {
    if (!this.client)
      return 0;
    return this.client.getState();
  }

}

