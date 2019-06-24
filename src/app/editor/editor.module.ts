import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameModule } from '../game/game.module';
import { MaterialModule } from '../material.module';
import { CardEditorComponent } from './card-editor/card-editor.component';
import { EditorDataService } from './editor-data.service';
import { EditorListComponent } from './editor-list/editor-list.component';
import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';
import { MechanicEditorComponent } from './mechanic-editor/mechanic-editor.component';
import { ParameterEditorComponent } from './parameter-editor/parameter-editor.component';
import { TargeterEditorComponent } from './targeter-editor/targeter-editor.component';
import { SetEditorComponent } from './set-editor/set-editor.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        EditorRoutingModule,
        GameModule
    ],
    declarations: [
        CardEditorComponent,
        EditorComponent,
        TargeterEditorComponent,
        MechanicEditorComponent,
        EditorListComponent,
        ParameterEditorComponent,
        SetEditorComponent
    ],
    exports: [],
    providers: [EditorDataService]
})
export class EditorModule {}
