import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CardEditorComponent } from './card-editor/card-editor.component';
import { EditorComponent } from './editor.component';
import { EditorListComponent } from './editor-list/editor-list.component';
import { SetEditorComponent } from './set-editor/set-editor.component';
import { SetCardsEditorComponent } from './set-cards-editor/set-cards-editor.component';

const routes: Routes = [
    {
        path: 'editor',
        component: EditorComponent,
        children: [
            { path: '', component: EditorListComponent },
            { path: 'card/:id', component: CardEditorComponent },
            { path: 'sets', component: SetEditorComponent },
            { path: 'sets/:id', component: SetCardsEditorComponent },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EditorRoutingModule {}
