
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';
import { Subject } from 'rxjs/Subject';
import { ApiService } from './api.service';
import { createObservableFor } from './lib/index';

import { PagedData } from '../_models/index';

/**
 * Generic service; must be implemented by the sub-class.
 * Note that this is not injectable - the subclass must be
 * set that way.
 */
export class PagedService<T> {
  private refreshSubject: Subject<PagedData<T>> = new Subject();
  private errorSubject: Subject<Response | any> = new Subject();
  private paged: PagedData<T>;
  uri: string;

  constructor(private api: ApiService) {
    this.paged = new PagedData<T>();
    this.paged.parseResultFromJson = (item) => this._parseItemFromJson(item);
  }

  onRefresh(): Observable<PagedData<T>> {
    return this.refreshSubject.asObservable();
  }

  onRefreshError(): Observable<Response | any> {
    return this.errorSubject.asObservable();
  }

  /** Override: load up the extra parameters for the filter.
   */
  filterParameters(params: any): any {
  }

  setPerPage(count: number, refresh = true) {
    if (count < 5) {
      count = 5;
    }
    if (count > 100) {
      count = 100;
    }
    this.paged.perPage = count;
    if (refresh) {
      this.refresh();
    }
  }

  loadNextPage() {
    if (this.paged.nextPage) {
      this.paged.page = this.paged.nextPage;
      this.refresh();
    }
  }

  loadPrevPage() {
    if (this.paged.prevPage) {
      this.paged.page = this.paged.prevPage;
      this.refresh();
    }
  }

  loadPage(page: number) {
    if (!this.paged.lastPage) {
      page = 1;
    } else if (page > this.paged.lastPage) {
      page = this.paged.lastPage;
    }
    if (page > 0) {
      this.paged.page = page;
      this.refresh();
    }
  }

  refresh() {
    const params = {
      page: this.paged.page,
      perPage: this.paged.perPage,
      offset: this.paged.offset,
      delta: this.paged.deltaPageCount
    };
    this.filterParameters(params);

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

  _parseItemFromJson(item: any): T | any {
    // Must be implememted by the subclass;
    return item;
  }
}
