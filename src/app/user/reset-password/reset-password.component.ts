import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'wcm-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  public message: string;
  public password: string;
  private token: string;
  public hide = true;

  public passwordControl = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(256)]);

  constructor(
    private route: ActivatedRoute,
    private auth: AuthenticationService
  ) {
    this.token = this.route.snapshot.paramMap.get('token');
  }

  passwordError() {
    return this.passwordControl.hasError('required') ? 'You must enter a value' :
      this.passwordControl.hasError('minlength') ? 'Must be at least 8 characters long.' :
      this.passwordControl.hasError('maxlength') ? 'Cannot be longer than 256 characters.' :
        '';
  }


  ok() {
    return this.passwordControl.valid;
  }

  submit() {
    this.message = 'Password reset in process.';
    this.auth.resetPassword(this.token, this.password).then((res) => {
      this.message = 'Your Password has been changed and you have been logged in.';
    }).catch((err) => {
      this.message = 'There was a problem reseting your password. Your token may have expired.';
    });
  }

  ngOnInit() {
  }

}

