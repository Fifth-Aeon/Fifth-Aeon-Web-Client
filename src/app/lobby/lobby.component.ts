import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { preload } from '../preloader';
import { WebClient, ClientState } from '../client';
import { AiDifficulty } from '../ai';


@Component({
  selector: 'bsc-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  public state = ClientState;
  public difficulty: AiDifficulty = AiDifficulty.Easy;
  public diffs = AiDifficulty;

  constructor(private router: Router, public client: WebClient) {
    client.returnToLobby();
    preload();
  }

  ngOnInit() { }

  public getState() {
    if (!this.client)
      return 0;
    return this.client.getState(); 
  }

}

