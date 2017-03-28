import { Injectable, Inject } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { ApiService } from './api.service';
import { MeService } from './me.service';
import { LoginAccount } from '../_models/login-account';

/**
 * Handles login and logout behaviors.
 */
@Injectable()
export class LoginService {
  constructor(
        private http: Http,
        private api: ApiService,
        private me: MeService
      ) {
    // Do nothing
  }

  /**
   * @return {Observable<string>} 'true' if a valid login, 'false' if not,
   *    and anything else for an error message.
   */
  login(username, password): Observable<boolean> {
    this.me.onLogout();
    console.log(`DEBUG Attempting login`);
    return this.http.post(this.api.toUrl('/auth/login'), JSON.stringify({
      username: username,
      password: password
    }))
    .map((response: Response) => {
      const token = (response.json() || {}).token;
      if (token) {
        this.me.onLogin({
          username: username,
          token: token
        });
        // TODO pull in user object for self.
        return true;
      }
      this.me.onLogout();
      return false;
    })
    .catch((err: Response | any) => {
      if (err instanceof Response) {
        console.log(`DEBUG Encountered bad response ${err.status}`);
        const body = err.json() || {};
        const error = new Error(body.message);
        // error.data = body;
        return Observable.throw(error);
      }
      console.log(`DEBUG Encountered error ${err}`);
      return Observable.throw(err);
    });
  }


  /**
   * @return {Observable<string>} 'true' if a valid logout, 'false' if not,
   *    and anything else for an error message.
   */
  logout(): Observable<boolean> {
    if (!this.me.isAuthenticated()) {
      this.me.onLogout();
      return Observable.apply('true');
    }
    this.api.post('/auth/logout', {})
      .map((response: Response) => {
        this.me.onLogout();
        return true;
      })
      .catch((err: Response | any) => {
        if (err instanceof Response) {
          const body = err.json() || {};
          const error = new Error(body.message);
          // error.data = body;
          return Observable.throw(error);
        }
        return Observable.throw(err.message || 'unknown error');
      });
  }
}
