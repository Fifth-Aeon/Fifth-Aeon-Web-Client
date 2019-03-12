import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../user/authentication.service';
import { apiURL } from '../url';

export interface TeamData {
    isLeader: boolean;
    teamName: string;
    joinCode?: string;
    teamMates: {
        name: string;
        isLeader: boolean;
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class TeamsService {
    private static createTeamUrl = `${apiURL}/api/tournament/createTeam`;
    private static joinTeamUrl = `${apiURL}/api/tournament/joinTeam`;
    private static teamInfoURL = `${apiURL}/api/tournament/teamInfo`;
    private static exitTeamUrl = `${apiURL}/api/tournament/exitTeam`;
    private static dissolveTeamUrl = `${apiURL}/api/tournament/dissolveTeam`;

    private teamData?: TeamData;
    private loaded = false;
    private loggedIn = false;

    constructor(private http: HttpClient, private auth: AuthenticationService) {
        auth.onAuth(data => {
            if (data !== null) {
                this.loadTeam();
                this.loggedIn = true;
            } else {
                this.loggedIn = false;
            }
        });
        auth.setRedirect('tournament/teams');
        auth.attemptLogin();
    }

    public exitOrDissolve(): any {
        if (!this.teamData) {
            console.warn('Not in team');
            return;
        }
        if (this.teamData.isLeader) {
            this.http.post(
                TeamsService.dissolveTeamUrl,
                {},
                { headers: this.auth.getAuthHeader() }
            );
        } else {
            this.http.post(
                TeamsService.exitTeamUrl,
                {},
                { headers: this.auth.getAuthHeader() }
            );
        }
    }

    public isInTeam() {
        return !this.loaded || this.teamData !== undefined;
    }

    public isLoggedIn() {
        return this.loggedIn;
    }

    private loadTeam() {
        if (this.teamData) {
            return;
        }
        this.http
            .get<TeamData>(TeamsService.teamInfoURL, {
                headers: this.auth.getAuthHeader()
            })
            .toPromise()
            .then(data => {
                this.teamData = data;
                this.loaded = true;
            })
            .catch(err => (this.loaded = true));
    }

    public getTeamData() {
        return this.teamData;
    }

    public createTeam(teamName: string) {
        if (this.teamData) {
            return;
        }
        this.http
            .post<TeamData>(
                TeamsService.createTeamUrl,
                { teamName },
                { headers: this.auth.getAuthHeader() }
            )
            .subscribe(data => (this.teamData = data));
    }

    public joinTeam(joinCode: string) {
        if (this.teamData) {
            return;
        }
        this.http
            .post<TeamData>(
                TeamsService.joinTeamUrl,
                { joinCode },
                { headers: this.auth.getAuthHeader() }
            )
            .subscribe(data => (this.teamData = data));
    }
}
