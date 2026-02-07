import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthenticationService } from 'app/user/authentication.service';
import { SettingsService } from './settings/settings.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
    constructor(
        private auth: AuthenticationService,
        private router: Router,
        private settings: SettingsService
    ) { }

    canActivate(route: ActivatedRouteSnapshot) {
        const ok = this.auth.loggedIn() || this.settings.isOffline();
        const redirectUrl = route.pathFromRoot
            .map(item => item.url.join('/'))
            .join('/');
        if (!ok) {
            this.auth.setRedirect(redirectUrl);
            this.router.navigateByUrl('/');
        }
        return ok;
    }
}
