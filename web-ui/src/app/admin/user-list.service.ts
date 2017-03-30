import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';

import { ApiService, PagedService } from '../_services/index';

import { PagedData } from '../_models/index';
import { User } from '../_models/index';


/**
 * Generic service; must be implemented by the sub-class.
 */
 @Injectable()
export class UserListService extends PagedService<User> {

  constructor(api: ApiService) {
    super(api);
    this.uri = '/api/v1/aaays';
  }

  /** Override: load up the extra parameters for the filter.
   */
  filterParameters(params: any): any {
    const c = (this.comment || '').trim();
    if (c.length > 0) {
      params.comment = c;
    }
    const n = (this.name || '').trim();
    if (n.length > 0) {
      params.name = n;
    }
    return params;
  }

  _parseItemFromJson(item: any): Aaay {
    return Aaay.parseFromJson(item);
  }
}
