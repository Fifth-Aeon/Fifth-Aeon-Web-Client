import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { WebClient } from './client';

import { AppComponent } from './app.component';
import { BattleshipGameComponent } from './battleship-game/battleship-game.component';

import { MdButtonModule, MdCheckboxModule, MdToolbarModule, MdProgressSpinnerModule } from '@angular/material';
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
    MdButtonModule, MdCheckboxModule, MdToolbarModule,
    MdProgressSpinnerModule, RouterModule.forRoot([
      { path: 'game', component: BattleshipGameComponent },
      { path: '', component: LobbyComponent },
      { path: '**', component: LobbyComponent }
      
    ])
  ],
  providers: [WebClient],
  bootstrap: [AppComponent]
})
export class AppModule { }
