import { Component, OnInit } from '@angular/core';
import { MdSnackBar } from '@angular/material';

import { Router, ActivatedRoute } from '@angular/router';
import { WebClient, ClientState } from '../client';

@Component({
  selector: 'bsc-private-lobby',
  templateUrl: './private-lobby.component.html',
  styleUrls: ['./private-lobby.component.css']
})
export class PrivateLobbyComponent implements OnInit {

  constructor(public snackbar: MdSnackBar, route: ActivatedRoute, private router: Router, public client: WebClient) {
    let gameId = route.snapshot.paramMap.get('id');
    if (gameId) {
      this.client.joinPrivateGame(gameId);
    }
    if (client.getState() != ClientState.PrivateLobby) {
      client.returnToLobby();
    }
  }
  public getLink() {
    this.snackbar.open('Copied url to clipboard', '', { duration: 2000 });
  }

  ngOnInit() {
  }

}
