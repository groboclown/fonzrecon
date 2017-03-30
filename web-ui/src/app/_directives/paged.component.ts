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
    this.refresh();
  }

  refresh() {
    this.pagedService.uri = this.uri;
    this.pagedService.refresh(this.queryParams);
  }

  nextPage() {
    this.pagedService.uri = this.uri;
    this.pagedService.loadNextPage(this.queryParams);
  }

  prevPage() {
    this.pagedService.uri = this.uri;
    this.pagedService.loadPrevPage(this.queryParams);
  }

  selectPage(page: number) {
    this.pagedService.uri = this.uri;
    this.pagedService.loadPage(page, this.queryParams);
  }

  setPerPage(pageCount: number) {
    this.pagedService.setPerPage(pageCount);
    this.pagedService.refresh(this.queryParams);
  }
}
