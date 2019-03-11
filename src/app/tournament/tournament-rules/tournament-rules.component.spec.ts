import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentRulesComponent } from './tournament-rules.component';

describe('TournamentRulesComponent', () => {
  let component: TournamentRulesComponent;
  let fixture: ComponentFixture<TournamentRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
