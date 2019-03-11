import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentSubmitComponent } from './tournament-submit.component';

describe('TournamentSubmitComponent', () => {
  let component: TournamentSubmitComponent;
  let fixture: ComponentFixture<TournamentSubmitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentSubmitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
