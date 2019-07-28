import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialSetupComponent } from './inital-setup.component';

describe('InitalSetupComponent', () => {
  let component: InitialSetupComponent;
  let fixture: ComponentFixture<InitialSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InitialSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InitialSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
