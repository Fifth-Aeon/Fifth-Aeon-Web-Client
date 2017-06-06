import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MdSnackBar } from '@angular/material';

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

  constructor(public snackbar: MdSnackBar, private router: Router, public client: WebClient) {
    client.returnToLobby();
    preload();
  }

  public getLink() {
    this.snackbar.open('Copied url to clipboard', '', { duration: 2000 });
  }

  ngOnInit() { }

  public getState() {
    if (!this.client)
      return 0;
    return this.client.getState();
  }

}

