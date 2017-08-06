import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndDialogComponent } from './end-dialog.component';

describe('EndDialogComponent', () => {
  let component: EndDialogComponent;
  let fixture: ComponentFixture<EndDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
