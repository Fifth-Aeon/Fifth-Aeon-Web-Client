import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { WebClient, ClientState } from '../client';

@Component({
  selector: 'bsc-private-lobby',
  templateUrl: './private-lobby.component.html',
  styleUrls: ['./private-lobby.component.css']
})
export class PrivateLobbyComponent implements OnInit {

  constructor(route: ActivatedRoute, private router: Router, public client: WebClient) {
    let gameId = route.snapshot.paramMap.get('id');
    if (gameId) {
      this.client.joinPrivateGame(gameId);
    }
    if (client.getState() != ClientState.PrivateLobby) {
      client.returnToLobby();
    }
  }

  ngOnInit() {
  }

}
