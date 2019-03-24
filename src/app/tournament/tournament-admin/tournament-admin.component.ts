import { Component, OnInit } from '@angular/core';
import { TournamentAdminService, TeamInfo, ContestantInfo } from '../tournament-admin.service';

@Component({
    selector: 'ccg-tournament-admin',
    templateUrl: './tournament-admin.component.html',
    styleUrls: ['./tournament-admin.component.scss']
})
export class TournamentAdminComponent implements OnInit {
    public teamInfo: TeamInfo[] = [];
    public contestantInfo: ContestantInfo[] = [];

    public displayedColumns: string[] = [
        'name',
        'members',
        'lastSubmission',
        'submissions',
        'download'
    ];

    constructor(public adminService: TournamentAdminService) {
        adminService.getTeamInfo().then(info => this.teamInfo = info);
        adminService.getContestantInfo().then(info => this.contestantInfo = info);
    }

    ngOnInit() {}
}
