import { Component, OnInit } from '@angular/core';
import { EditorDataService } from '../editor-data.service';
import { AuthenticationService } from 'app/user/authentication.service';

@Component({
    selector: 'ccg-set-editor',
    templateUrl: './set-editor.component.html',
    styleUrls: ['./set-editor.component.scss']
})
export class SetEditorComponent implements OnInit {
    constructor(
        public editorData: EditorDataService,
        private auth: AuthenticationService
    ) {
        this.auth.setRedirect('/editor/sets');
        this.auth.attemptLogin();
    }

    public newSet() {
      this.editorData.createSet();
    }

    ngOnInit() {}
}
