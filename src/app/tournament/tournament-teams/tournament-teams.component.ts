import { Component, OnInit } from '@angular/core';
import { TeamsService } from '../teams.service';

@Component({
    selector: 'ccg-tournament-teams',
    templateUrl: './tournament-teams.component.html',
    styleUrls: ['./tournament-teams.component.scss']
})
export class TournamentTeamsComponent implements OnInit {
    constructor(public teams: TeamsService) {}

    ngOnInit() {}

    public promptAndJoin() {
        const code = prompt('Enter the teams join code');
        if (code) {
            this.teams.joinTeam(code);
        }
    }

    public createTeam() {
        const name = prompt('Enter the name of the new team');
        if (name) {
            this.teams.createTeam(name);
        }
    }

    public teamDescription() {
        const data = this.teams.getTeamData();
        if (!data) {
            return 'You are not in a team';
        }
        return `You are ${
            data.isLeader ? 'the leader of' : 'a member of'
        } team ${data.teamName}.`;
    }

    public exitText() {
        const data = this.teams.getTeamData();
        if (!data) {
            return 'You are not in a team';
        }
        return `${data.isLeader ? 'Dissolve' : 'Quit'} your team`;
    }

    public exitAction() {
        if (
            confirm('Are you sure you want to do that? It cannot be reversed.')
        ) {
            console.log('confd');
            this.teams.exitOrDissolve();
        }
    }
}
