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
    public states = LandingState;
    public state = LandingState.Working;

    constructor(private auth: AuthenticationService) {
        auth.attemptLogin().then(loginOk => {
            if (!loginOk) {
                this.state = LandingState.WaitingForAction;
            }
        });
    }

    public newPlayer() {
        this.state = LandingState.NewPlayer;
    }

    public createGuestAccount() {
        this.state = LandingState.Working;
        this.auth.registerGuest();
    }

    public ngOnInit() {}
}
