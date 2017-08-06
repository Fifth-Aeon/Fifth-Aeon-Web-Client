import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { ClipboardModule } from 'ngx-clipboard';
import { HotkeyModule } from 'angular2-hotkeys';

import { SoundManager } from './sound';
import { WebClient } from './client';
import { Preloader } from './preloader';
import { OverlayService } from './overlay.service';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { InPlayGuard } from './in-play.guard';

import {
  MdButtonModule, MdRadioModule, MdIconModule,
  MdTooltipModule, MdSnackBarModule, MdToolbarModule,
  MdProgressSpinnerModule, MdDialogModule, MdListModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LobbyComponent } from './lobby/lobby.component';
import { PrivateLobbyComponent } from './private-lobby/private-lobby.component';
import { CardComponent } from './card/card.component';
import { ResourceSelectorComponent } from './resource-selector/resource-selector.component';
import { PlayerAvatarComponent } from './player-avatar/player-avatar.component';
import { CardChooserComponent } from './card-chooser/card-chooser.component';
import { RecordBarComponent } from './record-bar/record-bar.component';
import { EndDialogComponent } from './end-dialog/end-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    LobbyComponent,
    PrivateLobbyComponent,
    CardComponent,
    ResourceSelectorComponent,
    PlayerAvatarComponent,
    CardChooserComponent,
    RecordBarComponent,
    EndDialogComponent,
  ],
  entryComponents: [CardChooserComponent, EndDialogComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    ClipboardModule,
    HotkeyModule.forRoot(),
    MdButtonModule, MdIconModule, MdToolbarModule, MdRadioModule,
    MdProgressSpinnerModule, MdTooltipModule, MdSnackBarModule,
    MdDialogModule, MdListModule,
    RouterModule.forRoot([
      { path: 'game', component: GameComponent, canActivate: [InPlayGuard] },
      { path: 'private/:id', component: PrivateLobbyComponent },
      { path: 'private', component: PrivateLobbyComponent },
      { path: 'lobby', component: LobbyComponent },
      { path: '', component: LobbyComponent },
      { path: '**', component: LobbyComponent }
    ])
  ],
  providers: [SoundManager, WebClient, OverlayService, Preloader, InPlayGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
