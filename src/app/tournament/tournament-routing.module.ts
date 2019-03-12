import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TournamentComponent } from './tournament.component';
import { TournamentRulesComponent } from './tournament-rules/tournament-rules.component';
import { TournamentHelpComponent } from './tournament-help/tournament-help.component';
import { TournamentSubmitComponent } from './tournament-submit/tournament-submit.component';
import { TournamentTeamsComponent } from './tournament-teams/tournament-teams.component';

const routes: Routes = [
    {
        path: 'tournament',
        component: TournamentComponent,
        children: [
            { path: '', component: TournamentHelpComponent },
            { path: 'help', component: TournamentHelpComponent },
            { path: 'rules', component: TournamentRulesComponent },
            { path: 'submit', component: TournamentSubmitComponent },
            { path: 'teams', component: TournamentTeamsComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TournamentRoutingModule {}
