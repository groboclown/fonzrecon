import { Injectable, Inject } from '@angular/core';
import { LoginAccount } from '../_models/login-account';
import { User } from '../_models/user';
import { LowLoginAccountService } from './low-login-account.service';
import { ApiService } from './api.service';

import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


/**
 * Simple service for maintaining the logged-in user and the related
 * information for that user.
 */
@Injectable()
export class MeService {
  constructor(
    private api: ApiService,
    private lowLoginAccount: LowLoginAccountService
  ) {
    this.lowLoginAccount.getOnSimpleLoginLoaded()
      .subscribe(() => this.loadAboutMe());
    this.api.onGlobalError()
    .filter((r: Response) => r.status === 403 && !r.url.endsWith('/api/v1/users/about-me'))
    .subscribe((r: Response) => {
      // On forbidden errors, we refresh the account, to ensure
      // that we're still allowed to access what we think we can access.
      this.refresh();
    });
  }

  getLoginAccountSync(): LoginAccount {
    return this.lowLoginAccount.getLoginAccountSync();
  }

  getLoginAccount(): Observable<LoginAccount> {
    return this.lowLoginAccount.getOnLoginAccountLoaded();
  }

  isAuthenticated(): boolean {
    return this.lowLoginAccount.isAuthenticated();
  }

  isAdmin(): boolean {
    const account = this.lowLoginAccount.getLoginAccountSync();
    if (!account) {
      return false;
    }
    return account.isAuthenticated() && account.isAdmin;
  }

  refresh() {
    this.loadAboutMe();
  }

  private loadAboutMe() {
    this.api.get('/api/v1/users/about-me')
    .subscribe(
      (response: Response) => {
        this.lowLoginAccount.withAboutMeData(response.json() || { failed: true });
      },
      (err: Response | any) => {
        if (err instanceof Response) {
          // This is actually okay.  It generally means that the user isn't
          // logged in.
        }
        this.lowLoginAccount.withAboutMeData({ failed: true });
      });
  }
}
