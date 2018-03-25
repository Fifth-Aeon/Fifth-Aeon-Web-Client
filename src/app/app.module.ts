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
import { OpenPackComponent } from './open-pack/open-pack.component';
import { CollectionService } from './collection.service';
import { DamageDistributionDialogComponent } from './damage-distribution-dialog/damage-distribution-dialog.component';
import { SortableDirective } from './sortable.directive';
import { OverlayComponent } from './overlay/overlay.component';
import { DraftComponent } from './draft/draft.component';
import { DraftService } from './draft.service';
import { MessengerService } from './messenger.service';
import { MaterialModule } from './material.module';
import { LandingComponent } from './landing/landing.component';
import { EditorModule } from './editor/editor.module';
import { AppRoutingModule } from './app-routing.module';

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
    OpenPackComponent,
    DamageDistributionDialogComponent,
    SortableDirective,
    OverlayComponent,
    DraftComponent,
    LandingComponent,
  ],
  entryComponents: [CardChooserComponent, EndDialogComponent,
    SettingsDialogComponent, DeckMetadataDialogComponent, DamageDistributionDialogComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
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
  providers: [SoundManager, WebClient, DecksService, SpeedService, OverlayService,
    TipService, Preloader, InPlayGuard, LoggedInGuard, CollectionService, DraftService, MessengerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
