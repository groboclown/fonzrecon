import { Injectable, Inject } from '@angular/core';
import { LoginAccount } from '../_models/login-account';
import { User } from '../_models/user';
import { LowLoginAccountService } from './low-login-account.service';
import { ApiService } from './api.service';

import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';


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

  private loadAboutMe() {
    console.log(`DEBUG getting about-me`);
    return this.api.get('/api/v1/users/about-me')
    .subscribe(
      (response: Response) => {
        console.log(`DEBUG found with about me data`);
        return this.lowLoginAccount.withAboutMeData(response.json() || {});
      },
      (err: Response | any) => {
        console.log(`DEBUG get me data returned error ${err}`);
        if (err instanceof Response) {
          // TODO properly handle error.
        }
        return Observable.throw(err);
      },
      () => {
        console.log(`DEBUG get me data completed`);
      });
  }
}
