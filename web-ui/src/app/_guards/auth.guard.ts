import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MeService } from '../_services/index';
import { LoginAccount } from '../_models/index';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
      private router: Router,
      private me: MeService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.me.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/webui/login'], { queryParams: { returnUrl: state.url } });
  }
}
