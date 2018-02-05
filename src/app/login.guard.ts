import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { WebClient } from './client';
import { AuthenticationService } from 'app/user/authentication.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(private auth: AuthenticationService, private router: Router) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let ok = this.auth.loggedIn();
    if (!ok)
      this.auth.gotoLogin();
    return ok;
  }
}
