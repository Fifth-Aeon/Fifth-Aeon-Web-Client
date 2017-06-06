import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { ClipboardModule } from 'ngx-clipboard';

import { SoundManager } from './sound';
import { WebClient } from './client';

import { AppComponent } from './app.component';
import { BattleshipGameComponent } from './battleship-game/battleship-game.component';
import { InPlayGuard } from './in-play.guard';

import { MdButtonModule, MdRadioModule, MdIconModule, MdTooltipModule, MdSnackBarModule, MdToolbarModule, MdProgressSpinnerModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LobbyComponent } from './lobby/lobby.component';
import { PrivateLobbyComponent } from './private-lobby/private-lobby.component';

@NgModule({
  declarations: [
    AppComponent,
    BattleshipGameComponent,
    LobbyComponent,
    PrivateLobbyComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    ClipboardModule,
    MdButtonModule, MdIconModule, MdToolbarModule, MdRadioModule,
    MdProgressSpinnerModule, MdTooltipModule, MdSnackBarModule,
    RouterModule.forRoot([
      { path: 'game', component: BattleshipGameComponent, canActivate: [InPlayGuard] },
      { path: 'private/:id', component: PrivateLobbyComponent },
      { path: 'private', component: PrivateLobbyComponent },
      { path: 'lobby', component: LobbyComponent },
      { path: '', component: LobbyComponent },
      { path: '**', component: LobbyComponent }
    ])
  ],
  providers: [SoundManager, WebClient, InPlayGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
