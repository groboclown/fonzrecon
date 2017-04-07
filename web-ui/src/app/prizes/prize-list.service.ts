import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';

import { ApiService } from '../_services/index';
import { PagedData, PagingService } from '../paging/index';

import { Prize } from '../_models/index';

// TODO look at combining this with the ManagePrizeList class.

 @Injectable()
export class PrizeListService extends PagingService<Prize> {

  constructor(
      private _api: ApiService
  ) {
    super(_api);
    this.uri = '/api/v1/prizes';
  }

  /** Override: load up the extra parameters for the filter.
   */
  _filterParameters(queryParams: any, params: any) {
    if (queryParams.all) {
      params.all = 'true';
    }
  }

  _parseItemFromJson(item: any): Prize {
    return Prize.parseFromJson(item);
  }
}
