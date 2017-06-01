import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MdSnackBar } from '@angular/material';

import { preload } from '../preloader';
import { WebClient, ClientState } from '../client';


@Component({
  selector: 'bsc-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  public state = ClientState;
  private gameId: string;

  constructor(public snackbar: MdSnackBar, route: ActivatedRoute, private router: Router, public client: WebClient) {
    this.gameId = route.snapshot.paramMap.get('id');
    if (this.gameId) {
      this.client.joinPrivateGame(this.gameId);
    }
    preload();
  }

  public getLink() {
    this.snackbar.open('Copied url to clipboard', '', { duration: 2000 });
  }

  ngOnInit() {}

  public getState() {
    if (!this.client)
      return 0;
    return this.client.getState();
  }

}

