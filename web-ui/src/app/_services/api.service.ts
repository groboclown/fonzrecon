import { Injectable, Inject } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
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
    console.log(`DEBUG GET ${uri}`);
    return this.http.get(this.toUrl(uri), this.withGetHeaders());
  }

  post(uri: string, data: object): Observable<Response> {
    return this.http.post(this.toUrl(uri), JSON.stringify(data), this.withJsonHeaders());
  }

  put(uri: string, data: object): Observable<Response> {
    return this.http.put(this.toUrl(uri), JSON.stringify(data), this.withJsonHeaders());
  }

  delete(uri: string): Observable<Response> {
    return this.http.delete(this.toUrl(uri), this.withJsonHeaders());
  }

  toUrl(uri: string): string {
    if (uri[0] !== '/') {
      uri = '/' + uri;
    }
    return BASE_URL + uri;
  }

  withGetHeaders(): RequestOptions {
    return this.auth({});
  }

  withJsonHeaders(): RequestOptions {
    return this.auth({ 'Content-Type': 'application/json' });
  }

  private auth(headerDict: any): RequestOptions {
    const token = this.me.getAuthenticatedToken();
    if (token) {
      headerDict.Authorization = 'JWT ' + token;
    }
    return new RequestOptions({ headers: new Headers(headerDict) });
  }
}
