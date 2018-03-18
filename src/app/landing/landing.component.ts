import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../user/authentication.service';

@Component({
  selector: 'ccg-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  constructor(
    auth: AuthenticationService
  ) { }

  ngOnInit() {
  }

}
