import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ApiService } from '../_services/index';
import { User } from '../_models/index';

@Injectable()
export class EditUserService {

  constructor(
      private api: ApiService
  ) {}

  updateDetails(username: string | User, locale: string, organization: string) {
    let loc = locale;
    let org = organization;
    if (username instanceof User) {
      loc = loc || username.locale;
      org = org || username.organization;
    }
    return this.put(username, null, {
      locale: loc,
      organization: org
    });
  }

  updateUserRole(username: string | User, newRole: string): Observable<any> {
    return this.put(username, 'role', { role: newRole });
  }

  updatePointsToAward(username: string | User, points: number): Observable<any> {
    return this.put(username, 'reset-points-to-award', { points: points });
  }

  private put(username: string | User, extra: string, data: any): Observable<any> {
    return this.api.put(this.toUserUrl(username, extra), data)
    .map((response: Response) => response.json());
  }

  private toUserUrl(username: string | User, extra: string = null): string {
    let x = '';
    if (extra) {
      x = '/' + extra;
    }
    if (username instanceof User) {
      return '/api/v1/users/' + username.username + x;
    }
    return '/api/v1/users/' + username + x;
  }
}
