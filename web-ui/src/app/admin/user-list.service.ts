import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';

import { ApiService } from '../_services/index';
import { PagedData, PagingService } from '../paging/index';

import { User } from '../_models/index';


/**
 * Generic service; must be implemented by the sub-class.
 */
 @Injectable()
export class UserListService extends PagingService<User> {

  constructor(api: ApiService) {
    super(api);
    this.uri = '/api/v1/users';
  }

  /** Override: load up the extra parameters for the filter.
   */
  _filterParameters(queryParams: any, params: any) {
    // Do nothing for now.
  }

  _parseItemFromJson(item: any): User {
    return User.parseFromJson(item);
  }
}
