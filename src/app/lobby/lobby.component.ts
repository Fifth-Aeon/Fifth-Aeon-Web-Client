import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { WebClient, ClientState } from '../client';


@Component({
  selector: 'bsc-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  public state = ClientState;
  private gameId: string;

  constructor(route: ActivatedRoute, private router: Router, public client: WebClient) {
    this.gameId = route.snapshot.paramMap.get('id');
    if (this.gameId) {
      this.client.joinPrivateGame(this.gameId);
    }
  }


  ngOnInit() {
  }

  public getState() {
    if (!this.client)
      return 0;
    return this.client.getState();
  }

}

