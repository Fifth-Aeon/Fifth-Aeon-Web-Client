import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../user/authentication.service';

enum LandingState {
  Working,
  WaitingForAction,
  NewPlayer
}

@Component({
  selector: 'ccg-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  states = LandingState;
  state: LandingState;

  constructor(
    private auth: AuthenticationService
  ) {
    const loginInProgress = auth.attemptLogin();
    this.state = loginInProgress ? LandingState.Working : LandingState.WaitingForAction;
  }

  newPlayer() {
    this.state = LandingState.NewPlayer;
  }

  createGuestAccount() {
    this.state = LandingState.Working;
    this.auth.registerGuest();
  }

  ngOnInit() {
  }

}
