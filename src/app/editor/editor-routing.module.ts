import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CardEditorComponent } from './card-editor/card-editor.component';
import { EditorComponent } from './editor.component';
import { EditorListComponent } from './editor-list/editor-list.component';

const routes: Routes = [
    {
        path: 'editor',
        component: EditorComponent,
        children: [
            { path: '', component: EditorListComponent },
            { path: 'card/:id', component: CardEditorComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EditorRoutingModule {}
