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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    EditorRoutingModule
  ],
  declarations: [CardEditorComponent, EditorComponent, TargeterEditorComponent, MechanicEditorComponent],
  exports: []
})
export class EditorModule { }
