import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordBarComponent } from './record-bar.component';

describe('RecordBarComponent', () => {
    let component: RecordBarComponent;
    let fixture: ComponentFixture<RecordBarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RecordBarComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RecordBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
