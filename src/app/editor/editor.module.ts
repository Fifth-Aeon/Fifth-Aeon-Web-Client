import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardEditorComponent } from './card-editor/card-editor.component';
import { MaterialModule } from '../material.module';
import { RouterModule } from '@angular/router';
import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TargeterEditorComponent } from './targeter-editor/targeter-editor.component';
import { MechanicEditorComponent } from './mechanic-editor/mechanic-editor.component';
import { GameModule } from '../game/game.module';
import { EditorListComponent } from './editor-list/editor-list.component';
import { EditorDataService } from './editor-data.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    EditorRoutingModule,
    GameModule
  ],
  declarations: [CardEditorComponent, EditorComponent, TargeterEditorComponent, MechanicEditorComponent, EditorListComponent],
  exports: [],
  providers: [EditorDataService]
})
export class EditorModule { }
