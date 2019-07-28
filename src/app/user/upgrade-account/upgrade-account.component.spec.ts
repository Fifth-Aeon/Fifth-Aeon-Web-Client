import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradeAccountComponent } from './upgrade-account.component';

describe('UpgradeAccountComponent', () => {
  let component: UpgradeAccountComponent;
  let fixture: ComponentFixture<UpgradeAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpgradeAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpgradeAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
