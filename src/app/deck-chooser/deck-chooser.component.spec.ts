import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckChooserComponent } from './deck-chooser.component';

describe('DeckChooserComponent', () => {
  let component: DeckChooserComponent;
  let fixture: ComponentFixture<DeckChooserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeckChooserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeckChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
