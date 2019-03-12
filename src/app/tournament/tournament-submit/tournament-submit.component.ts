import { Component, OnInit } from '@angular/core';
import { TeamsService, SubmissionsData } from '../teams.service';
import { apiURL } from '../../url';

@Component({
    selector: 'ccg-tournament-submit',
    templateUrl: './tournament-submit.component.html',
    styleUrls: ['./tournament-submit.component.scss']
})
export class TournamentSubmitComponent implements OnInit {
    public submissions: SubmissionsData[] = [];

    constructor(public team: TeamsService) {
        if (team.isLoggedIn()) {
            team.getSubmissions().then(subs => (this.submissions = subs));
        }
    }

    public getDlUrl(sub: SubmissionsData) {
        return `${apiURL}/api/tournament/submission/${sub.submissionID}`;
    }

    ngOnInit() {}

    public fileChange(event: Event): void {
        const files = (<HTMLInputElement>event.target).files;
        if (!files) {
            return;
        }
        const file = files.item(0);
        if (!file) {
            return;
        }
        this.team
            .uploadSubmission(file)
            .then(() =>
                this.team
                    .getSubmissions()
                    .then(subs => (this.submissions = subs))
            );
    }
}
