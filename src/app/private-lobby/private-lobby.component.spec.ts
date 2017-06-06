import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateLobbyComponent } from './private-lobby.component';

describe('PrivateLobbyComponent', () => {
  let component: PrivateLobbyComponent;
  let fixture: ComponentFixture<PrivateLobbyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivateLobbyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
