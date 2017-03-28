import { Injectable, Inject } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { MeService } from './me.service';
import { LoginAccount } from '../_models/login-account';

// FIXME make this a parameter.
const BASE_URL = 'http://localhost:3000';

@Injectable()
export class ApiService {

  constructor(
        private http: Http,
        private me: MeService
      ) {
    // Do nothing
  }

  get(uri: string): Observable<Response> {
    return this.http.get(this.toUrl(uri), this.auth());
  }

  post(uri: string, data: object): Observable<Response> {
    return this.http.post(this.toUrl(uri), JSON.stringify(data), this.auth());
  }

  put(uri: string, data: object): Observable<Response> {
    return this.http.put(this.toUrl(uri), JSON.stringify(data), this.auth());
  }

  delete(uri: string): Observable<Response> {
    return this.http.delete(this.toUrl(uri), this.auth());
  }

  toUrl(uri: string): string {
    if (uri[0] !== '/') {
      uri = '/' + uri;
    }
    return BASE_URL + uri;
  }

  private auth(): RequestOptions {
    if (this.me.isAuthenticated()) {
      const headers = new Headers({ 'Authorization': 'JWT ' + this.me.userData().token });
      return new RequestOptions({ headers: headers });
    }
    return null;
  }
}
