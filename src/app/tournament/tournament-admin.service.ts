import { Injectable } from '@angular/core';
import { apiURL } from '../url';
import { AuthenticationService } from '../user/authentication.service';
import { HttpClient } from '@angular/common/http';

export interface TeamInfo {
    name: string;
    id: number;
    lastSubmission: Date;
    numberOfSubmissions: number;
    members: string[];
}

export interface ContestantInfo {
    name: string;
    teamName: string;
}

@Injectable({
    providedIn: 'root'
})
export class TournamentAdminService {
    private static getTeamInfoUrl = `${apiURL}/api/tournament/getTeams`;
    private static getContestantInfoUrl = `${apiURL}/api/tournament/contestantInfo`;
    private static getLatestSubmission = `${apiURL}/api/tournament/latestSubmission/`;

    constructor(private http: HttpClient, private auth: AuthenticationService) {
        auth.setRedirect('tournament/admin');
        auth.attemptLogin();
    }

    public getLatestSubmission(teamName: string, id: number) {
        return this.auth.afterLogin().then(() => {
            return this.http
                .get(TournamentAdminService.getLatestSubmission + id, {
                    headers: this.auth.getAuthHeader(),
                    responseType: 'blob'
                })
                .toPromise().then(buffer =>
                    saveAs(
                        buffer,
                        `${teamName}-submission.zip`
                    )
                );
        });
    }


    public getTeamInfo() {
        return this.auth.afterLogin().then(() => {
            return this.http
                .get<TeamInfo[]>(TournamentAdminService.getTeamInfoUrl, {
                    headers: this.auth.getAuthHeader()
                })
                .toPromise();
        });
    }

    public getContestantInfo() {
        return this.auth.afterLogin().then(() => {
            return this.http
                .get<ContestantInfo[]>(TournamentAdminService.getContestantInfoUrl, {
                    headers: this.auth.getAuthHeader()
                })
                .toPromise();
        });
    }
}
