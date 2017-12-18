import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckMetadataDialogComponent } from './deck-metadata-dialog.component';

describe('DeckMetadataDialogComponent', () => {
  let component: DeckMetadataDialogComponent;
  let fixture: ComponentFixture<DeckMetadataDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeckMetadataDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeckMetadataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
