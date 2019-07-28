import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'app/material.module';
import { GameModule } from 'app/game/game.module';
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
    declarations: [AdminPanelComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        AdminRoutingModule,
        GameModule
    ]
})
export class AdminModule {}
