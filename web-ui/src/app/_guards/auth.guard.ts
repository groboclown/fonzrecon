import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MeService } from '../_services/index';
import { LoginAccount } from '../_models/index';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
      private router: Router,
      private me: MeService) {
    this.me.getLoginAccount()
      .subscribe((loginAccount: LoginAccount) => {
        if (!loginAccount.isAuthenticated()) {
          console.log(`DEBUG Force user to login page`);
          // this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        }
      });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log(`DEBUG Checking whether the route is active.`);
    if (this.me.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  }
}
