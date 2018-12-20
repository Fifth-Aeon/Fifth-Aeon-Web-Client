import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { existenceValidator } from '../../existence.validator';

@Component({
    selector: 'ccg-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    nameControl: FormControl;
    passwordControl: FormControl;
    hide = true;

    username: string;
    password: string;
    message: string;
    working = false;

    constructor(
        private auth: AuthenticationService,
        private router: Router,
        http: HttpClient
    ) {
        this.nameControl = new FormControl(
            '',
            [Validators.required],
            [existenceValidator(http, 'emailorpassword', false, true)]
        );
        this.passwordControl = new FormControl('', [
            Validators.required,
            Validators.minLength(8)
        ]);
    }

    startRequest() {
        this.message = 'Working..';
        this.working = true;
        this.nameControl.disable();
        this.passwordControl.disable();
    }

    endRequest() {
        this.working = false;
        this.nameControl.enable();
        this.passwordControl.enable();
    }

    handleError(err) {
        console.error(err, err.error);
        if (err.error) {
            this.message = err.error.message || err.error;
        } else {
            this.message = err.status;
        }
        this.endRequest();
    }

    submit() {
        this.startRequest();
        this.auth
            .login(this.username, this.password)
            .then(() => {
                this.router.navigate([`/lobby`]);
            })
            .catch(this.handleError.bind(this));
    }

    reset() {
        this.startRequest();
        this.auth
            .requestPasswordReset(this.username)
            .then(() => {
                alert('A password reset link has been sent to your email.');
                this.endRequest();
            })
            .catch(this.handleError.bind(this));
    }

    nameError() {
        return this.nameControl.hasError('required')
            ? 'You must enter a value.'
            : this.nameControl.hasError('availability')
            ? 'No account exists with that username or email.'
            : '';
    }

    passwordError() {
        return this.passwordControl.hasError('required')
            ? 'You must enter a value'
            : this.passwordControl.hasError('minlength')
            ? 'Must be at least 8 characters long.'
            : '';
    }

    ok() {
        return this.nameControl.valid && this.passwordControl.valid;
    }

    canReset() {
        return this.nameControl.valid;
    }

    ngOnInit() {}
}
