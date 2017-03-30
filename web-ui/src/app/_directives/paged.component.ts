import { Component, OnInit, Input } from '@angular/core';

import { PagedData } from '../_models/index';
import { PagedService } from '../_services/index';

@Component({
    moduleId: module.id,
    selector: 'app-paged-list',
    templateUrl: 'paged.component.html'
})
export class PagedComponent<T> implements OnInit {
  @Input() pagedService: PagedService<T>;
  @Input() uri: string;
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
    this.pagedService.onRefresh()
    .subscribe((pagedData: PagedData<T>) => {
      this.pagedData = pagedData;
    });

    this.pagedService.onRefreshError()
    .subscribe((error: any) => {
      console.warn(`Paged result error: ${error}`);
      if (error.message) {
        this.error = error.error;
      }
    });
    this.onRefresh();
  }

  onRefresh() {
    this.pagedService.uri = this.uri;
    this.pagedService.refresh();
  }

  onNextPage() {
    this.pagedService.uri = this.uri;
    this.pagedService.loadNextPage();
  }

  onPrevPage() {
    this.pagedService.uri = this.uri;
    this.pagedService.loadPrevPage();
  }

  onPage(page: number) {
    this.pagedService.uri = this.uri;
    this.pagedService.loadPage(page);
  }

  setPerPage(pageCount: number) {
    this.pagedService.setPerPage(pageCount, true);
  }
}
