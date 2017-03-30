import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';

import { ApiService } from '../_services/index';
import { PagedData, PagingService } from '../paging/index';

import { Aaay } from './aaay.model';


/**
 * Generic service; must be implemented by the sub-class.
 */
 @Injectable()
export class AaayListService extends PagingService<Aaay> {
  constructor(
      api: ApiService
  ) {
    super(api);
    this.uri = '/api/v1/aaays';
  }

  /** Override: load up the extra parameters for the filter.
   */
  _filterParameters(queryParams: any, params: any) {
    const c = (queryParams.comment || '').trim();
    if (c.length > 0) {
      params.comment = c;
    }
    const n = (queryParams.name || '').trim();
    if (n.length > 0) {
      params.name = n;
    }
  }

  _parseItemFromJson(item: any): Aaay {
    return Aaay.parseFromJson(item);
  }
}
