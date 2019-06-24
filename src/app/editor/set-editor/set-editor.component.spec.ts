import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetEditorComponent } from './set-editor.component';

describe('SetEditorComponent', () => {
  let component: SetEditorComponent;
  let fixture: ComponentFixture<SetEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
