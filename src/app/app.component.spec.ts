import { TestBed, async } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { HotkeyModule } from 'angular2-hotkeys';
import { RouterModule } from '@angular/router';
import { WebClient } from './client';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [HotkeyModule, RouterModule],
      providers: [WebClient]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
