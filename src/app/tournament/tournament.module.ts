import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { TournamentRoutingModule } from './tournament-routing.module';
import { TournamentComponent } from './tournament.component';
import { TournamentRulesComponent } from './tournament-rules/tournament-rules.component';
import { TournamentHelpComponent } from './tournament-help/tournament-help.component';
import { TournamentTeamsComponent } from './tournament-teams/tournament-teams.component';
import { TournamentSubmitComponent } from './tournament-submit/tournament-submit.component';
import { ClipboardModule } from 'ngx-clipboard';
import { NewTeamComponent } from './new-team/new-team.component';
import { TournamentAdminComponent } from './tournament-admin/tournament-admin.component';
import { PrizesComponent } from './prizes/prizes.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        TournamentRoutingModule,
        ClipboardModule
    ],
    declarations: [
        TournamentComponent,
        TournamentRulesComponent,
        TournamentHelpComponent,
        TournamentTeamsComponent,
        TournamentSubmitComponent,
        NewTeamComponent,
        TournamentAdminComponent,
        PrizesComponent
    ],
    exports: [],
    providers: []
})
export class TournamentModule {}
