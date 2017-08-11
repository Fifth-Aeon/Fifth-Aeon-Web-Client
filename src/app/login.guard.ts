import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { WebClient } from './client';

@Injectable() 
export class LoggedInGuard implements CanActivate {
  constructor(private client: WebClient, private router: Router) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let ok = this.client.isLoggedIn();
    if (!ok)
      this.router.navigate(['/lobby']);
    return ok;
  }
}
