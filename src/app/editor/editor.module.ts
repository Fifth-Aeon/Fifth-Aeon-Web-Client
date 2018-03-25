import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardEditorComponent } from './card-editor/card-editor.component';
import { MaterialModule } from '../material.module';
import { RouterModule } from '@angular/router';
import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    EditorRoutingModule
  ],
  declarations: [CardEditorComponent, EditorComponent],
  exports: []
})
export class EditorModule { }
