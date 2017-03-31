import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import { Subject } from 'rxjs/Subject';
import { ApiService } from '../_services/index';

/**
 * Update the user's password.
 */
@Injectable()
export class ChangePasswordService {
  constructor(
      private api: ApiService
  ) {}

  changePassword(username: string, password: string, verificationCode: string): Observable<any> {
    return this.api.put('/auth/validate', {
      username: username,
      password: password,
      resetAuthenticationToken: verificationCode
    })
    .map((response: Response) => response.json());
  }
}
