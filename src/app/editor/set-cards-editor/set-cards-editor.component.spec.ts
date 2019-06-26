import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetCardsEditorComponent } from './set-cards-editor.component';

describe('SetCardsEditorComponent', () => {
  let component: SetCardsEditorComponent;
  let fixture: ComponentFixture<SetCardsEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetCardsEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetCardsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
