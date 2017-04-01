import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { User } from '../_models/user';

import { ApiService } from './api.service';

@Injectable()
export class UserDetailsService {
  constructor(
      private api: ApiService
  ) {}

  getUser(username: string | User): Observable<User> {
    let name = username;
    if (username instanceof User) {
      name = username.username;
    }
    return this.api.get('/api/v1/users/' + name + '/details')
    .map((response: Response) => {
      const json = response.json();
      return User.parseFromJson(
        json.User || json.UserBrief || json.UserRef
      );
    });
  }
}
