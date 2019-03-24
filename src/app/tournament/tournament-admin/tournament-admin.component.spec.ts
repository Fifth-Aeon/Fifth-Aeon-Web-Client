import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentAdminComponent } from './tournament-admin.component';

describe('TournamentAdminComponent', () => {
  let component: TournamentAdminComponent;
  let fixture: ComponentFixture<TournamentAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
