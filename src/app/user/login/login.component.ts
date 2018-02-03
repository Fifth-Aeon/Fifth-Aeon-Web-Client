import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { unusedValidator } from '../../unused.validator';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';


@Component({
  selector: 'wcm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  nameControl: FormControl;
  passwordControl: FormControl;
  hide = true;

  username: string;
  password: string;

  constructor(
    private auth: AuthenticationService,
    private router: Router
  ) {
    this.nameControl = new FormControl('', [Validators.required]);
    this.passwordControl = new FormControl('', [Validators.required]);
  }

  submit() {
    this.auth.login(this.username, this.password).then(() => {
      this.router.navigate([`/comics/create`]);
    });
  }

  nameError() {
    return this.nameControl.hasError('required') ? 'You must enter a value' :

      '';
  }

  passwordError() {
    return this.passwordControl.hasError('required') ? 'You must enter a value' :
      this.passwordControl.hasError('minlength') ? 'Must be at least 8 characters long.' :
        '';
  }

  ok() {
    return this.nameControl.valid  && this.passwordControl.valid;
  }


  ngOnInit() {
  }


}
