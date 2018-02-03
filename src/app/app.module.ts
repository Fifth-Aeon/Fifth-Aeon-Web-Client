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
import {
  MatButtonModule, MatRadioModule, MatIconModule,
  MatTooltipModule, MatSnackBarModule, MatToolbarModule,
  MatProgressSpinnerModule, MatDialogModule, MatListModule,
  MatCardModule, MatSliderModule, MatCheckboxModule, MatPaginatorModule,
  MatTabsModule, MatFormFieldModule, MatInputModule, MatMenuModule,
  MatSelectModule
} from '@angular/material';

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
import { SpeedService } from 'app/speed.service';
import { environment } from 'environments/environment';
import { DeckMetadataDialogComponent } from './deck-metadata-dialog/deck-metadata-dialog.component';
import { LoginComponent } from 'app/user/login/login.component';
import { RegisterComponent } from 'app/user/register/register.component';
import { VerifyEmailComponent } from 'app/user/verify-email/verify-email.component';
import { AuthenticationService } from 'app/user/authentication.service';
import { UserModule } from 'app/user/user.module';
import { ResetPasswordComponent } from 'app/user/reset-password/reset-password.component';
if ('serviceWorker' in navigator && environment.production) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('ngsw-worker.js')
      .then(function (registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }).catch(function (err) {
        console.error('ServiceWorker registration failed: ', err);
      });
  });
}

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
    DeckMetadataDialogComponent,
  ],
  entryComponents: [CardChooserComponent, EndDialogComponent, SettingsDialogComponent, DeckMetadataDialogComponent],
  imports: [
    BrowserModule,
    // ServiceWorkerModule.register('ngsw-worker.js'),
    UserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ClipboardModule,
    HotkeyModule.forRoot(),
    MatButtonModule, MatIconModule, MatToolbarModule, MatRadioModule,
    MatProgressSpinnerModule, MatTooltipModule, MatSnackBarModule,
    MatDialogModule, MatListModule, MatCardModule, MatSliderModule,
    MatCheckboxModule, MatPaginatorModule, MatTabsModule, MatFormFieldModule,
    MatInputModule, MatMenuModule, MatSelectModule,
    Angulartics2Module.forRoot([Angulartics2GoogleAnalytics]),
    RouterModule.forRoot([
      { path: 'game', component: GameComponent, canActivate: [InPlayGuard] },
      { path: 'deck', component: DeckEditorComponent, canActivate: [LoggedInGuard] },
      { path: 'select', component: DeckChooserComponent, canActivate: [LoggedInGuard] },
      { path: 'private/:id', component: PrivateLobbyComponent },
      { path: 'private', component: PrivateLobbyComponent },
      { path: 'lobby', component: LobbyComponent },
      { path: '', component: LobbyComponent },
      { path: 'login', component: LoginComponent},
      { path: 'register', component: RegisterComponent},
      { path: 'reset-pass', component: ResetPasswordComponent}
      { path: '**', component: LobbyComponent }
    ])
  ],
  providers: [SoundManager, WebClient, DecksService, SpeedService, OverlayService, TipService, Preloader, InPlayGuard, LoggedInGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
