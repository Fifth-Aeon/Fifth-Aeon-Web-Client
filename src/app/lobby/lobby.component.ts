import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { WebClient, ClientState } from '../client';
import { AiDifficulty } from '../ai';


@Component({
  selector: 'ccg-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  public state = ClientState;
  public difficulty: AiDifficulty = AiDifficulty.Easy;
  public diffs = AiDifficulty;

  constructor(private router: Router, public client: WebClient) {
    if (client.getState() != ClientState.UnAuth && client.getState() != ClientState.Waiting)
      client.returnToLobby();
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

