import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthenticationService } from 'app/user/authentication.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
    constructor(private auth: AuthenticationService, private router: Router) {}
    canActivate(  route: ActivatedRouteSnapshot) {
        const ok = this.auth.loggedIn();
        const redirectUrl = route.pathFromRoot.map(item => item.url.join('/')).join('/');
        if (!ok) {
            this.auth.setRedirect(redirectUrl);
            this.router.navigateByUrl('/');
        }
        return ok;
    }
}
