import { Injectable } from '@angular/core';

import { User } from '../_models/user';


@Injectable()
export class UserService {
  private userUrl = 'api/v1/users';


  getUsers(): User[] {
    // TODO
    return null;
  }
}
