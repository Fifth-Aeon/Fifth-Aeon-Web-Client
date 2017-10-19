// Angular
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

// Vendor Angular Modules
import { ClipboardModule } from 'ngx-clipboard';
import { HotkeyModule } from 'angular2-hotkeys';
import { Ng2FittextModule } from "ng2-fittext/ng2fittext";
import {
  MdButtonModule, MdRadioModule, MdIconModule,
  MdTooltipModule, MdSnackBarModule, MdToolbarModule,
  MdProgressSpinnerModule, MdDialogModule, MdListModule,
  MdCardModule, MdSliderModule, MdCheckboxModule, MdPaginatorModule,
  MdTabsModule
} from '@angular/material';
import { Angulartics2Module, Angulartics2GoogleTagManager } from 'angulartics2';

// App Angular Services
import { SoundManager } from './sound';
import { WebClient } from './client';
import { Preloader } from './preloader';
import { OverlayService } from './overlay.service';
import { DecksService } from './decks.service';
import { TipService } from './tips';

// App Angular Components
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { InPlayGuard } from './in-play.guard';
import { LoggedInGuard } from './login.guard';
import { LobbyComponent } from './lobby/lobby.component';
import { PrivateLobbyComponent } from './private-lobby/private-lobby.component';
import { ResourceSelectorComponent } from './resource-selector/resource-selector.component';
import { PlayerAvatarComponent } from './player-avatar/player-avatar.component';
import { CardChooserComponent } from './card-chooser/card-chooser.component';
import { RecordBarComponent } from './record-bar/record-bar.component';
import { EndDialogComponent } from './end-dialog/end-dialog.component';
import { DeckEditorComponent } from './deck-editor/deck-editor.component';
import { ResourceDisplayComponent } from './resource-display/resource-display.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { DeckChooserComponent } from './deck-chooser/deck-chooser.component';
import { CardComponent } from './card/card.component';

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
    DeckEditorComponent,
    ResourceDisplayComponent,
    SettingsDialogComponent,
    DeckChooserComponent,
  ],
  entryComponents: [CardChooserComponent, EndDialogComponent, SettingsDialogComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    ClipboardModule,
    HotkeyModule.forRoot(),
    Ng2FittextModule,
    MdButtonModule, MdIconModule, MdToolbarModule, MdRadioModule,
    MdProgressSpinnerModule, MdTooltipModule, MdSnackBarModule,
    MdDialogModule, MdListModule, MdCardModule, MdSliderModule,
    MdCheckboxModule, MdPaginatorModule, MdTabsModule,
    Angulartics2Module.forRoot([ Angulartics2GoogleTagManager ]),    
    RouterModule.forRoot([
      { path: 'game', component: GameComponent, canActivate: [InPlayGuard] },
      { path: 'deck', component: DeckEditorComponent, canActivate: [LoggedInGuard] },
      { path: 'select', component: DeckChooserComponent, canActivate: [LoggedInGuard] },
      { path: 'private/:id', component: PrivateLobbyComponent },
      { path: 'private', component: PrivateLobbyComponent },
      { path: 'lobby', component: LobbyComponent },
      { path: '', component: LobbyComponent },
      { path: '**', component: LobbyComponent }
    ])
  ],
  providers: [SoundManager, WebClient, DecksService, OverlayService, TipService, Preloader, InPlayGuard, LoggedInGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
