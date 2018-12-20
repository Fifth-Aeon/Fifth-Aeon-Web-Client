import { async, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { HotkeyModule } from 'angular2-hotkeys';
import { AppComponent } from './app.component';
import { WebClient } from './client';

describe('AppComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AppComponent],
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
