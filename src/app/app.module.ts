// Angular
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';

// Vendor Angular Modules
import { ClipboardModule } from 'ngx-clipboard';
import { HotkeyModule } from 'angular2-hotkeys';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

// App Angular Services
import { SoundManager } from './sound';
import { WebClient } from './client';
import { Preloader } from './preloader';
import { DecksService } from './decks.service';
import { TipService } from './tips';

// App Angular Components
import { AppComponent } from './app.component';
import { InPlayGuard } from './in-play.guard';
import { LoggedInGuard } from './login.guard';
import { LobbyComponent } from './lobby/lobby.component';
import { PrivateLobbyComponent } from './private-lobby/private-lobby.component';


import { EndDialogComponent } from './end-dialog/end-dialog.component';
import { DeckEditorComponent } from './deck-editor/deck-editor.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { DeckChooserComponent } from './deck-chooser/deck-chooser.component';
import { SpeedService } from 'app/speed.service';
import { environment } from 'environments/environment';
import { DeckMetadataDialogComponent } from './deck-metadata-dialog/deck-metadata-dialog.component';
import { LoginComponent } from 'app/user/login/login.component';
import { RegisterComponent } from 'app/user/register/register.component';
import { VerifyEmailComponent } from 'app/user/verify-email/verify-email.component';
import { AuthenticationService } from 'app/user/authentication.service';
import { UserModule } from 'app/user/user.module';
import { ResetPasswordComponent } from 'app/user/reset-password/reset-password.component';
import { OpenPackComponent } from './open-pack/open-pack.component';
import { CollectionService } from './collection.service';
import { SortableDirective } from './sortable.directive';
import { DraftComponent } from './draft/draft.component';
import { DraftService } from './draft.service';
import { MessengerService } from './messenger.service';
import { MaterialModule } from './material.module';
import { LandingComponent } from './landing/landing.component';
import { EditorModule } from './editor/editor.module';
import { AppRoutingModule } from './app-routing.module';
import { GameModule } from './game/game.module';

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,
    PrivateLobbyComponent,
    EndDialogComponent,
    DeckEditorComponent,
    SettingsDialogComponent,
    DeckChooserComponent,
    DeckMetadataDialogComponent,
    OpenPackComponent,
    SortableDirective,
    DraftComponent,
    LandingComponent,
  ],
  entryComponents: [EndDialogComponent, SettingsDialogComponent, DeckMetadataDialogComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    GameModule,
    UserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ClipboardModule,
    HotkeyModule.forRoot(),
    MaterialModule,
    Angulartics2Module.forRoot([Angulartics2GoogleAnalytics]),
    EditorModule
  ],
  providers: [SoundManager, WebClient, DecksService, SpeedService,
    TipService, Preloader, InPlayGuard, LoggedInGuard, CollectionService, DraftService, MessengerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
