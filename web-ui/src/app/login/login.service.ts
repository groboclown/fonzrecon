import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';
import { Subject } from 'rxjs/Subject';
import { ApiService, LowLoginAccountService } from '../_services/index';
import {  } from './low-login-account.service';
import { LoginAccount } from '../_models/login-account';
import { createObservableFor } from '../_services/lib/index';

/**
 * Handles login and logout behaviors.
 */
@Injectable()
export class LoginService {
  private userInitialized = new Subject<boolean>();

  constructor(
        private api: ApiService,
        private lowLoginAccount: LowLoginAccountService
      ) {}

  /**
   * @return {Observable<string>} 'true' if a valid login, 'false' if not,
   *    and anything else for an error message.
   */
  login(username, password): Observable<boolean> {
    // Logout first to ensure we don't pass in any tokens.
    this.lowLoginAccount.onLogout();
    return this.api.post('/auth/login', {
      username: username,
      password: password
    })
    .map((response: Response) => {
      const token = (response.json() || {}).token;
      if (token) {
        this.lowLoginAccount.withLoginData({
          username: username,
          token: token
        });
        return true;
      }
      this.lowLoginAccount.onLogout();
      return false;
    })
    .catch((err: Response | any) => {
      if (err instanceof Response) {
        const body = err.json() || {};
        const error = new Error(body.message);
        // error.data = body;
        return Observable.throw(error);
      }
      return Observable.throw(err);
    });
  }


  /**
   * @return {Observable<string>} 'true' if a valid logout, 'false' if not,
   *    and anything else for an error message.
   */
  logout() {
    if (!this.lowLoginAccount.isAuthenticated()) {
      this.lowLoginAccount.onLogout();
      return createObservableFor(true);
    }
    this.api.post('/auth/logout', {})
    .subscribe(
      (response: Response) => {
        this.lowLoginAccount.onLogout();
      },
      (err: Response | any) => {
        if (err instanceof Response) {
          const body = err.json() || {};
          const error = new Error(body.message);
          // error.data = body;
          throw error;
        }
        throw err;
      });
  }
}
