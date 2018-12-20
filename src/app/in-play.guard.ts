import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { WebClient } from './client';

@Injectable()
export class InPlayGuard implements CanActivate {
    constructor(private client: WebClient, private router: Router) {}
    canActivate(): boolean {
        const ok = this.client.isInGame();
        if (!ok) {
            this.router.navigate(['/lobby']);
        }
        return ok;
    }
}
