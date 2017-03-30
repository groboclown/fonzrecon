import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MeService } from '../_services/index';
import { LoginAccount } from '../_models/index';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
      private router: Router,
      private me: MeService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.me.isAdmin()) {
      return true;
    }
    this.router.navigate(['/']);
  }
}
