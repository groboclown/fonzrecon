import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { User } from '../_models/user';

import { ApiService } from './api.service';
import { PagingService, PagedData } from '../paging/index';

@Injectable()
export class UserListService extends PagingService<User> {
  constructor(
      private _api: ApiService
  ) {
    super(_api);
    this.uri = '/api/v1/users';
  }

  getUserNamesMatching(startsWith: string): Observable<string[]> {
    const lc = startsWith.toLowerCase();
    return this.getUsersMatching(startsWith)
    .map((paged: PagedData<User>) => {
      console.log(`Processing ${paged.currentPage}`);
      const ret: string[] = [];
      pagedLoop:
      for (let i = 0; i < paged.results.length; i++) {
        const user = paged.results[i];
        for (let j = 0; j < user.names.length; j++) {
          if (user.names[j].toLowerCase().startsWith(lc)) {
            ret.push(user.names[j]);
            continue pagedLoop;
          }
        }
        ret.push(user.username);
      }
      return ret;
    });
  }

  getUsersMatching(startsWith: string): Observable<PagedData<User>> {
    return this.getRefresh({ like: startsWith });
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
