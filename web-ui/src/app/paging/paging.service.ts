
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

  setPerPage(count: number): void {
    if (count < 5) {
      count = 5;
    }
    if (count > 100) {
      count = 100;
    }
    this.paged.perPage = count;
  }

  setCurrentPage(page: number): void {
    if (page <= 0) {
      page = 1;
    }
    if (this.paged.lastPage && this.paged.lastPage > 0 && page > this.paged.lastPage) {
      page = this.paged.lastPage;
    }
    this.paged.page = page;
  }

  loadNextPage(queryParams: any): void {
    if (this.paged.nextPage) {
      this.paged.page = this.paged.nextPage;
      this.refresh(queryParams);
    }
  }

  loadPrevPage(queryParams: any): void {
    if (this.paged.prevPage) {
      this.paged.page = this.paged.prevPage;
      this.refresh(queryParams);
    }
  }

  loadFirstPage(queryParams: any): void {
    this.loadPage(1, queryParams);
  }

  loadLastPage(queryParams: any): void {
    if (this.paged.lastPage) {
      this.loadPage(this.paged.lastPage, queryParams);
    }
  }

  loadPage(page: number, queryParams: any): void {
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

  refresh(queryParams: any): void {
    this.singleRequest(queryParams)
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

  /**
   * This is only for operations that use a single request, and not the
   * whole paging component, such as tag type-ahead components.
   */
  getRefresh(queryParams: any): Observable<PagedData<T>> {
    return this.singleRequest(queryParams)
    .map((response: Response) => {
      this.paged.updateFromJson(response.json());
      this.refreshSubject.next(this.paged);
      return this.paged;
    })
    .catch((err: Response | any) => {
      this.errorSubject.next(err);
      throw err;
    });
  }


  private singleRequest(queryParams: any): Observable<Response> {
    const params = {
      page: this.paged.page,
      perPage: this.paged.perPage,
      offset: this.paged.offset,
      delta: this.paged.deltaPageCount
    };
    this._filterParameters(queryParams, params);
    return this.api.get(this.uri, params);
  }
}
