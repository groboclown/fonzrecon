
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';
import { Subject } from 'rxjs/Subject';
import { ApiService } from '../_services/api.service';
import { createObservableFor } from '../_services/lib/index';

import { PagedData } from './paging.model';

/**
 * Generic service; must be implemented by the sub-class.
 * Note that this is not injectable - the subclass must be
 * set that way.
 */
export class PagingService<T> {
  private refreshSubject: Subject<PagedData<T>> = new Subject();
  private errorSubject: Subject<Response | any> = new Subject();
  private paged: PagedData<T>;
  uri: string;

  constructor(
      private api: ApiService
  ) {
    this.paged = new PagedData<T>();
    this.paged.parseResultFromJson = (item) => this._parseItemFromJson(item);
  }

  /** Override: load up the extra parameters for the filter.
   */
  _filterParameters(queryParams: any, params: any) {
    throw new Error('_filterParameters not implemented');
  }

  _parseItemFromJson(item: any): T | any {
    throw new Error('_parseItemFromJson not implemented');
  }

  onRefresh(): Observable<PagedData<T>> {
    return this.refreshSubject.asObservable();
  }

  onRefreshError(): Observable<Response | any> {
    return this.errorSubject.asObservable();
  }

  setPerPage(count: number) {
    if (count < 5) {
      count = 5;
    }
    if (count > 100) {
      count = 100;
    }
    this.paged.perPage = count;
  }

  loadNextPage(queryParams: any) {
    if (this.paged.nextPage) {
      this.paged.page = this.paged.nextPage;
      this.refresh(queryParams);
    }
  }

  loadPrevPage(queryParams: any) {
    if (this.paged.prevPage) {
      this.paged.page = this.paged.prevPage;
      this.refresh(queryParams);
    }
  }

  loadFirstPage(queryParams: any) {
    this.loadPage(1, queryParams);
  }

  loadLastPage(queryParams: any) {
    if (this.paged.lastPage) {
      this.loadPage(this.paged.lastPage, queryParams);
    }
  }

  loadPage(page: number, queryParams: any) {
    if (!this.paged.lastPage) {
      page = 1;
    } else if (page > this.paged.lastPage) {
      page = this.paged.lastPage;
    }
    if (page > 0 && page !== this.paged.page) {
      this.paged.page = page;
      this.refresh(queryParams);
    }
  }

  refresh(queryParams: any) {
    const params = {
      page: this.paged.page,
      perPage: this.paged.perPage,
      offset: this.paged.offset,
      delta: this.paged.deltaPageCount
    };
    this._filterParameters(queryParams, params);

    this.api.get(this.uri, params)
      .subscribe(
        (response: Response) => {
          this.paged.updateFromJson(response.json());
          this.refreshSubject.next(this.paged);
        },
        (err: Response | any) => {
          this.errorSubject.next(err);
        }
      );
  }

}
