import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import { Subject } from 'rxjs/Subject';
import { ApiService } from '../_services/index';

/**
 * Resets the user's password.
 */
@Injectable()
export class ResetPasswordService {
  constructor(
      private api: ApiService
  ) {}

  resetPassword(username: string, email: string): Observable<any> {
    return this.api.put('/auth/password-change', {
      username: username,
      email: email
    })
    .map((response: Response) => response.json());
  }
}
