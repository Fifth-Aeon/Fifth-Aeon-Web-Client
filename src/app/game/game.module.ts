import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card/card.component';
import { GameComponent } from './game.component';

import { OverlayService } from './overlay.service';

import { ResourceSelectorComponent } from './resource-selector/resource-selector.component';
import { ResourceDisplayComponent } from './resource-display/resource-display.component';
import { CardChooserComponent } from './card-chooser/card-chooser.component';
import { RecordBarComponent } from './record-bar/record-bar.component';
import { DamageDistributionDialogComponent } from './damage-distribution-dialog/damage-distribution-dialog.component';
import { OverlayComponent } from './overlay/overlay.component';
import { MaterialModule } from '../material.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule
  ],
  declarations: [
    CardComponent,
    GameComponent,
    ResourceSelectorComponent,
    ResourceDisplayComponent,
    CardChooserComponent,
    RecordBarComponent,
    DamageDistributionDialogComponent,
    OverlayComponent
  ],
  providers: [OverlayService],
  entryComponents: [DamageDistributionDialogComponent, CardChooserComponent],
  exports: [CardComponent, GameComponent]
})
export class GameModule { }
