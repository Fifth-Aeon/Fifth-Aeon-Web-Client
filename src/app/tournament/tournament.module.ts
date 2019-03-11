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

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        TournamentRoutingModule
    ],
    declarations: [
        TournamentComponent,
        TournamentRulesComponent,
        TournamentHelpComponent,
        TournamentTeamsComponent,
        TournamentSubmitComponent
    ],
    exports: [],
    providers: []
})
export class TournamentModule {}
