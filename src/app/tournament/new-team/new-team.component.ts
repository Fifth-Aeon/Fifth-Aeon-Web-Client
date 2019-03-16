import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from '../../user/authentication.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TeamsService } from '../teams.service';

@Component({
    selector: 'ccg-new-team',
    templateUrl: './new-team.component.html',
    styleUrls: ['./new-team.component.scss']
})
export class NewTeamComponent {
    nameControl: FormControl;
    contactNameControl: FormControl;
    contactEmailControl: FormControl;
    contactOrgControl: FormControl;
    controls = [
        this.nameControl,
        this.contactEmailControl,
        this.contactEmailControl,
        this.contactOrgControl
    ];
    hide = true;

    name = '';
    contactName = '';
    contactEmail = '';
    contactOrg = '';
    message = '';
    working = false;
    error = '';

    constructor(
        private auth: AuthenticationService,
        private router: Router,
        private team: TeamsService
    ) {
        this.nameControl = new FormControl('', [
            Validators.required,
            Validators.pattern(/^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/)
        ]);
        this.contactNameControl = new FormControl('', [Validators.required]);
        this.contactEmailControl = new FormControl('', [
            Validators.required,
            Validators.email
        ]);
        this.contactOrgControl = new FormControl('', [Validators.required]);
    }

    startRequest() {
        this.message = 'Working..';
        this.working = true;
        this.nameControl.disable();
    }

    endRequest() {
        this.working = false;
        this.nameControl.enable();
    }

    handleError(err: any) {
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
        this.team
            .createTeam(
                this.name,
                this.contactEmail,
                this.contactName,
                this.contactOrg
            )
            .then(() => this.endRequest())
            .catch(err => {
                this.error = err.error.message;
                console.error(this.error, err);

                this.endRequest();
            });
    }


    nameError() {
        return this.nameControl.hasError('required')
            ? 'You must enter a value.'
            : this.nameControl.hasError('availability')
            ? 'No account exists with that username or email.'
            : '';
    }

    contactError() {
        return this.contactNameControl.hasError('required')
            ? 'You must enter a value.'
            : '';
    }

    orgError() {
        return this.contactOrgControl.hasError('required')
            ? 'You must enter a value.'
            : '';
    }

    emailError() {
        return this.contactEmailControl.hasError('required')
            ? 'You must enter a value'
            : this.contactEmailControl.hasError('email')
            ? 'Must be a valid email address.'
            : this.contactEmailControl.hasError('availability')
            ? 'That email is already in use.'
            : '';
    }

    ok() {
        return this.nameControl.valid && this.contactEmailControl.valid;
    }
}
