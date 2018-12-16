import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthenticationService } from 'app/user/authentication.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(private auth: AuthenticationService, private router: Router) { }
  canActivate():  boolean {
    let ok = this.auth.loggedIn();
    if (!ok)
      this.router.navigateByUrl('/');
    return ok;
  }
}
