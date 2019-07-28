// Angular
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HotkeyModule } from 'angular2-hotkeys';
import { Angulartics2Module } from 'angulartics2';
import { SpeedService } from 'app/speed.service';
import { UserModule } from 'app/user/user.module';
// Vendor Angular Modules
import { ClipboardModule } from 'ngx-clipboard';
import { AppRoutingModule } from './app-routing.module';
// App Angular Components
import { AppComponent } from './app.component';
import { WebClient } from './client';
import { CollectionService } from './collection.service';
import { DailyDialogComponent } from './daily-dialog/daily-dialog.component';
import { DeckChooserComponent } from './deck-chooser/deck-chooser.component';
import { DeckEditorComponent } from './deck-editor/deck-editor.component';
import { DeckMetadataDialogComponent } from './deck-metadata-dialog/deck-metadata-dialog.component';
import { DecksService } from './decks.service';
import { DraftService } from './draft.service';
import { DraftComponent } from './draft/draft.component';
import { EditorModule } from './editor/editor.module';
import { EndDialogComponent } from './end-dialog/end-dialog.component';
import { GameModule } from './game/game.module';
import { GameManager } from './gameManager';
import { InPlayGuard } from './in-play.guard';
import { LandingComponent } from './landing/landing.component';
import { LobbyComponent } from './lobby/lobby.component';
import { LoggedInGuard } from './login.guard';
import { MaterialModule } from './material.module';
import { MessengerService } from './messenger.service';
import { OpenPackComponent } from './open-pack/open-pack.component';
import { PlayerAvatarComponent } from './player-avatar/player-avatar.component';
import { Preloader } from './preloader';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
// App Angular Services
import { SoundManager } from './sound';
import { TipService } from './tips';
import { TournamentModule } from './tournament/tournament.module';
import { AdminModule } from './admin/admin.module';

@NgModule({
    declarations: [
        AppComponent,
        LobbyComponent,
        EndDialogComponent,
        DeckEditorComponent,
        SettingsDialogComponent,
        DeckChooserComponent,
        DeckMetadataDialogComponent,
        OpenPackComponent,
        DraftComponent,
        LandingComponent,
        PlayerAvatarComponent,
        DailyDialogComponent
    ],
    entryComponents: [
        EndDialogComponent,
        SettingsDialogComponent,
        DeckMetadataDialogComponent,
        DailyDialogComponent
    ],
    imports: [
        BrowserModule,
        GameModule,
        UserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        ClipboardModule,
        HotkeyModule.forRoot(),
        MaterialModule,
        Angulartics2Module.forRoot(),
        EditorModule,
        TournamentModule,
        AdminModule,
        AppRoutingModule
    ],
    providers: [
        SoundManager,
        WebClient,
        GameManager,
        DecksService,
        SpeedService,
        TipService,
        Preloader,
        InPlayGuard,
        LoggedInGuard,
        CollectionService,
        DraftService,
        MessengerService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
