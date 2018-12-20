import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { CardChooserComponent } from './card-chooser/card-chooser.component';
import { CardComponent } from './card/card.component';
import { DamageDistributionDialogComponent } from './damage-distribution-dialog/damage-distribution-dialog.component';
import { GameComponent } from './game.component';
import { OverlayService } from './overlay.service';
import { OverlayComponent } from './overlay/overlay.component';
import { RecordBarComponent } from './record-bar/record-bar.component';
import { ResourceDisplayComponent } from './resource-display/resource-display.component';
import { ResourceSelectorComponent } from './resource-selector/resource-selector.component';



@NgModule({
    imports: [CommonModule, MaterialModule],
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
export class GameModule {}
