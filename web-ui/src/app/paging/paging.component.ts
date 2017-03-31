import { Component, OnInit, Input } from '@angular/core';

import { PagedData } from './paging.model';
import { PagingService } from './paging.service';
import { AlertStatus, AlertMessage } from '../widgets/index';

@Component({
    moduleId: module.id,
    selector: 'app-paged-list',
    templateUrl: 'paging.component.html'
})
export class PagingComponent<T> implements OnInit {
  @Input() pagingService: PagingService<T>;
  @Input() queryParams: any = {};
  alertStatus = new AlertStatus();
  pagedData = new PagedData<T>();
  isError = false;

  hasData() {
    return !this.isError && this.pagedData
      && this.pagedData.results && this.pagedData.results.length > 0;
  }

  isNotErrorNoData() {
    return !this.isError && !this.hasData();
  }

  ngOnInit() {
    this.alertStatus.onMessageEvent()
    .subscribe((message: AlertMessage) => {
      this.isError = message && message.isError;
    });

    this.pagingService.onRefresh()
    .subscribe((pagedData: PagedData<T>) => {
      this.pagedData = pagedData;
    });

    this.pagingService.onRefreshError()
    .subscribe((error: any) => {
      this.alertStatus.error(error);
    });
    this.refresh();
  }

  refresh() {
    this.pagingService.refresh(this.queryParams);
  }

  nextPage() {
    this.pagingService.loadNextPage(this.queryParams);
  }

  prevPage() {
    this.pagingService.loadPrevPage(this.queryParams);
  }

  selectPage(page: number) {
    this.pagingService.loadPage(page, this.queryParams);
  }

  setPerPage(pageCount: number) {
    this.pagingService.setPerPage(pageCount);
    this.pagingService.refresh(this.queryParams);
  }
}
