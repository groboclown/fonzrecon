import { Injectable, Inject } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { LowLoginAccountService } from './low-login-account.service';
import { LoginAccount } from '../_models/login-account';

// FIXME make this a parameter.
const BASE_URL = 'http://localhost:3000';

@Injectable()
export class ApiService {
  private globalErrors = new Subject<Response>();

  constructor(
        private http: Http,
        private lowLoginAccount: LowLoginAccountService
      ) {
    // Do nothing
  }

  onGlobalError(): Observable<Response> {
    return this.globalErrors.asObservable();
  }

  get(uri: string, params: object = null): Observable<Response> {
    console.log(`DEBUG GET ${uri}`);
    return this.http.get(this.toUrl(uri), this.withGetHeaders(params))
    .catch((r: any) => {
      if (r instanceof Response) {
        this.globalErrors.next(r);
      }
      throw r;
    });
  }

  post(uri: string, data: object): Observable<Response> {
    return this.http.post(this.toUrl(uri), JSON.stringify(data), this.withJsonHeaders())
    .catch((r: any) => {
      if (r instanceof Response) {
        this.globalErrors.next(r);
      }
      throw r;
    });
  }

  put(uri: string, data: object): Observable<Response> {
    return this.http.put(this.toUrl(uri), JSON.stringify(data), this.withJsonHeaders())
    .catch((r: any) => {
      if (r instanceof Response) {
        this.globalErrors.next(r);
      }
      throw r;
    });
  }

  postFile(uri: string, file: File, formFileName: string): Observable<Response> {
    const formData: FormData = new FormData();
    formData.append(formFileName, file, file.name);
    return this.http.post(this.toUrl(uri), formData, this.auth({}))
    .catch((r: any) => {
      if (r instanceof Response) {
        this.globalErrors.next(r);
      }
      throw r;
    });
  }

  delete(uri: string): Observable<Response> {
    return this.http.delete(this.toUrl(uri), this.withJsonHeaders())
    .catch((r: any) => {
      if (r instanceof Response) {
        this.globalErrors.next(r);
      }
      throw r;
    });
  }

  toUrl(uri: string): string {
    if (!uri) {
      return null;
    }
    if (uri[0] !== '/') {
      uri = '/' + uri;
    }
    return BASE_URL + uri;
  }

  withGetHeaders(params): RequestOptions {
    const ret = this.auth({});
    if (params) {
      ret.search = params;
    }
    return ret;
  }

  withJsonHeaders(): RequestOptions {
    return this.auth({ 'Content-Type': 'application/json' });
  }

  private auth(headerDict: any): RequestOptions {
    const token = this.lowLoginAccount.getAuthenticatedToken();
    if (token) {
      headerDict.Authorization = 'JWT ' + token;
    }
    headerDict.Accept = 'application/json';
    return new RequestOptions({ headers: new Headers(headerDict) });
  }
}
