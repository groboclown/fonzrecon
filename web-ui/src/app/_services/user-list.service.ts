import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { User } from '../_models/user';

import { ApiService } from './api.service';
import { PagingService } from '../paging/index';

@Injectable()
export class UserListService extends PagingService<User> {
  constructor(
      private _api: ApiService
  ) {
    super(_api);
  }

  _filterParameters(queryParams: any, params: any) {
    if (queryParams.nameLike && queryParams.nameLike.length > 0) {
      if (!queryParams.nameLike.match(/\^|\$|\*|\+/)) {
        params.like = '.*?' + queryParams.nameLike + '.*?';
      } else {
        params.like = queryParams.nameLike;
      }
    }
  }

  _parseItemFromJson(item: any): User | any {
    return User.parseFromJson(item);
  }
}
