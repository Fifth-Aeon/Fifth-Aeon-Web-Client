import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { unusedValidator } from '../../unused.validator';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';


@Component({
  selector: 'wcm-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  nameControl: FormControl;
  emailControl: FormControl;
  passwordControl: FormControl;
  hide = true;

  username: string;
  email: string;
  password: string;

  constructor(
    private http: HttpClient,
    private auth: AuthenticationService,
    private router: Router
  ) {
    this.nameControl = new FormControl('', [Validators.required, Validators.maxLength(30),
    Validators.pattern(/^[a-zA-Z0-9\-\_]+$/)], [unusedValidator(http, 'username')]);
    this.emailControl = new FormControl('', [Validators.required, Validators.email], [unusedValidator(http, 'email', true)]);
    this.passwordControl = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(256)]);

  }

  create() {
    this.auth.register(this.username, this.email, this.password).then(() => {
      this.router.navigate([`/comics/create`]);
    });
  }

  nameError() {
    return this.nameControl.hasError('required') ? 'You must enter a value' :
      this.nameControl.hasError('pattern') ? 'Only lower case letters, numbers, dashes or underscores may be used.' :
        this.nameControl.hasError('availability') ? 'That username is already in use.' :
          '';
  }

  emailError() {
    return this.emailControl.hasError('required') ? 'You must enter a value' :
      this.emailControl.hasError('email') ? 'Must be a valid email address.' :
        this.emailControl.hasError('availability') ? 'That email is already in use.' :
          '';
  }

  passwordError() {
    return this.passwordControl.hasError('required') ? 'You must enter a value' :
      this.passwordControl.hasError('minlength') ? 'Must be at least 8 characters long.' :
        '';
  }

  ok() {
    return this.nameControl.valid && this.emailControl.valid && this.passwordControl.valid;
  }


  ngOnInit() {
  }

}
