import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargeterEditorComponent } from './targeter-editor.component';

describe('TargeterEditorComponent', () => {
    let component: TargeterEditorComponent;
    let fixture: ComponentFixture<TargeterEditorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TargeterEditorComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TargeterEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
