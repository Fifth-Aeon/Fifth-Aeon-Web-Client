import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterComponent } from './user/register/register.component';
import { LoginComponent } from './user/login/login.component';
import { VerifyEmailComponent } from './user/verify-email/verify-email.component';
import { ResetPasswordComponent } from './user/reset-password/reset-password.component';
import { LandingComponent } from './landing/landing.component';
import { GameComponent } from './game/game.component';
import { InPlayGuard } from './in-play.guard';
import { LoggedInGuard } from './login.guard';
import { DeckChooserComponent } from './deck-chooser/deck-chooser.component';
import { PrivateLobbyComponent } from './private-lobby/private-lobby.component';
import { DeckEditorComponent } from './deck-editor/deck-editor.component';
import { OpenPackComponent } from './open-pack/open-pack.component';
import { DraftComponent } from './draft/draft.component';
import { LobbyComponent } from './lobby/lobby.component';

const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'game', component: GameComponent, canActivate: [InPlayGuard] },
    { path: 'deck', component: DeckEditorComponent, canActivate: [LoggedInGuard] },
    { path: 'select', component: DeckChooserComponent, canActivate: [LoggedInGuard] },
    { path: 'private/:id', component: PrivateLobbyComponent, canActivate: [LoggedInGuard] },
    { path: 'private', component: PrivateLobbyComponent, canActivate: [LoggedInGuard] },
    { path: 'packs', component: OpenPackComponent, canActivate: [LoggedInGuard] },
    { path: 'lobby', component: LobbyComponent, canActivate: [LoggedInGuard] },
    { path: 'draft', component: DraftComponent, canActivate: [LoggedInGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'reset/:token', component: ResetPasswordComponent },
    { path: 'verify/:token', component: VerifyEmailComponent },
    { path: '**', component: LobbyComponent, canActivate: [LoggedInGuard] }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes),
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
