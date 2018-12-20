import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MechanicEditorComponent } from './mechanic-editor.component';

describe('MechanicEditorComponent', () => {
    let component: MechanicEditorComponent;
    let fixture: ComponentFixture<MechanicEditorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MechanicEditorComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MechanicEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
