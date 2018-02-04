import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenPackComponent } from './open-pack.component';

describe('OpenPackComponent', () => {
  let component: OpenPackComponent;
  let fixture: ComponentFixture<OpenPackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenPackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenPackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
