import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyDialogComponent } from './daily-dialog.component';

describe('DailyDialogComponent', () => {
  let component: DailyDialogComponent;
  let fixture: ComponentFixture<DailyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
