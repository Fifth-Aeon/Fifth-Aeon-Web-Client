import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentHelpComponent } from './tournament-help.component';

describe('TournamentHelpComponent', () => {
  let component: TournamentHelpComponent;
  let fixture: ComponentFixture<TournamentHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
