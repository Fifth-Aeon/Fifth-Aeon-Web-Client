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

import { MdButtonModule, MdIconModule, MdTooltipModule, MdSnackBarModule, MdToolbarModule, MdProgressSpinnerModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LobbyComponent } from './lobby/lobby.component';

@NgModule({
  declarations: [
    AppComponent,
    BattleshipGameComponent,
    LobbyComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    ClipboardModule,
    MdButtonModule, MdIconModule, MdToolbarModule,
    MdProgressSpinnerModule, MdTooltipModule, MdSnackBarModule,
    RouterModule.forRoot([
      { path: 'game', component: BattleshipGameComponent, canActivate: [InPlayGuard] },
      { path: 'lobby/:id', component: LobbyComponent },
      { path: 'lobby', component: LobbyComponent },
      { path: '', component: LobbyComponent },
      { path: '**', component: LobbyComponent }
    ])
  ],
  providers: [SoundManager, WebClient, InPlayGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
