import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CardEditorComponent } from './card-editor/card-editor.component';
import { EditorComponent } from './editor.component';
import { EditorListComponent } from './editor-list/editor-list.component';
import { SetEditorComponent } from './set-editor/set-editor.component';
import { SetCardsEditorComponent } from './set-cards-editor/set-cards-editor.component';
import { SetSelectorComponent } from './set-selector/set-selector.component';

const routes: Routes = [
    {
        path: 'editor',
        component: EditorComponent,
        children: [
            { path: '', component: EditorListComponent },
            { path: 'card/:id', component: CardEditorComponent },
            { path: 'sets', component: SetEditorComponent },
            { path: 'sets/:id', component: SetCardsEditorComponent },
            { path: 'myMods', component: SetSelectorComponent },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EditorRoutingModule {}
