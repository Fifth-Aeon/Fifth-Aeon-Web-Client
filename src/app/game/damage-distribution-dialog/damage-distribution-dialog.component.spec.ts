import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DamageDistributionDialogComponent } from './damage-distribution-dialog.component';

describe('DamageDistributionDialogComponent', () => {
  let component: DamageDistributionDialogComponent;
  let fixture: ComponentFixture<DamageDistributionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DamageDistributionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DamageDistributionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
