import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../user/authentication.service';
import { apiURL } from '../url';
import { saveAs } from 'file-saver';


export interface TeamData {
    isLeader: boolean;
    teamName: string;
    joinCode?: string;
    teamMates: {
        name: string;
        isLeader: boolean;
    }[];
}

export interface SubmissionsData {
    submitter: string;
    submitted: Date;
    submissionID: number;
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

    private static submissionURL = `${apiURL}/api/tournament/submit`;
    private static getSubmissionsURL = `${apiURL}/api/tournament/submissions`;

    private teamData?: TeamData;
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

    public downloadSubmission(sub: SubmissionsData) {
        const url = `${apiURL}/api/tournament/submission/${sub.submissionID}`;
        const name = this.teamData ? this.teamData.teamName : '';
        this.http
            .get(url, {
                headers: this.auth.getAuthHeader(),
                responseType: 'blob'
            })
            .toPromise()
            .then(buffer => saveAs(buffer, `${sub.submitted.toISOString()}-${name}-submission.zip`));
    }

    public getSubmissions() {
        return this.http
            .get<SubmissionsData[]>(TeamsService.getSubmissionsURL, {
                headers: this.auth.getAuthHeader()
            })
            .toPromise()
            .then(submissions => {
                for (const sub of submissions) {
                    sub.submitted = new Date(sub.submitted);
                }
                return submissions;
            });
    }

    public uploadSubmission(file: File) {
        const formData = new FormData();
        formData.append('submission', file);

        return this.http
            .post(TeamsService.submissionURL, formData, {
                headers: this.auth.getAuthHeader()
            })
            .toPromise();
    }

    public exitOrDissolve(): any {
        if (!this.teamData) {
            console.warn('Not in team');
            return;
        }
        const url = this.teamData.isLeader
            ? TeamsService.dissolveTeamUrl
            : TeamsService.exitTeamUrl;
        this.http
            .post(url, {}, { headers: this.auth.getAuthHeader() })
            .toPromise()
            .then(res => {
                this.teamData = undefined;
            });
    }

    public isInTeam() {
        return this.teamData !== undefined;
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
            });
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
            .toPromise().then(data => (this.teamData = data))
            .catch(err => {
                alert('Could not create team: ' + err.error.message);
            });
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
            .toPromise().then(data => (this.teamData = data))
            .catch(err => {
                alert('Could not join team: ' + err.error.message);
            });
    }
}
