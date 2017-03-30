import { Component, OnInit, Input } from '@angular/core';

import { PagedData } from './paging.model';
import { PagingService } from './paging.service';

@Component({
    moduleId: module.id,
    selector: 'app-paged-list',
    templateUrl: 'paging.component.html'
})
export class PagingComponent<T> implements OnInit {
  @Input() pagingService: PagingService<T>;
  @Input() uri: string;
  @Input() queryParams: any = {};
  error: string;
  pagedData: PagedData<T>;

  isError() {
    return this.error && this.error.length > 0;
  }

  hasData() {
    return !this.isError() && this.pagedData
      && this.pagedData.results && this.pagedData.results.length > 0;
  }

  isNotErrorNoData() {
    return !this.isError() && !this.hasData();
  }

  ngOnInit() {
    this.pagingService.onRefresh()
    .subscribe((pagedData: PagedData<T>) => {
      this.pagedData = pagedData;
    });

    this.pagingService.onRefreshError()
    .subscribe((error: any) => {
      console.warn(`Paged result error: ${error}`);
      if (error.message) {
        this.error = error.error;
      }
    });
    this.refresh();
  }

  refresh() {
    this.pagingService.uri = this.uri;
    this.pagingService.refresh(this.queryParams);
  }

  nextPage() {
    this.pagingService.uri = this.uri;
    this.pagingService.loadNextPage(this.queryParams);
  }

  prevPage() {
    this.pagingService.uri = this.uri;
    this.pagingService.loadPrevPage(this.queryParams);
  }

  selectPage(page: number) {
    this.pagingService.uri = this.uri;
    this.pagingService.loadPage(page, this.queryParams);
  }

  setPerPage(pageCount: number) {
    this.pagingService.setPerPage(pageCount);
    this.pagingService.refresh(this.queryParams);
  }
}
