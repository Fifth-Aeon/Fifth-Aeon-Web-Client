import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { WebClient, ClientState } from '../client';


@Component({
  selector: 'bsc-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  public state = ClientState; 

  constructor(private router:Router, public client: WebClient) { 
  }


  ngOnInit() {
  }

  public getState() {
    if (!this.client)
      return 0;
    return this.client.getState();
  }

}

