import {
  Component, OnInit, AfterViewInit, Input,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AaayList } from './aaay-list.model';
import { AaayListService } from './aaay-list.service';

@Component({
    moduleId: module.id,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-aaay-list',
    templateUrl: 'aaay-list.component.html'
})
export class AaayListComponent implements OnInit, AfterViewInit {
  @Input() refreshEvent: Observable<any>;
  aaayList: AaayList = new AaayList();

  constructor(
      private aaayListService: AaayListService,
      private changeDetection: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.refreshEvent) {
      this.refreshEvent
      .subscribe(() => {
        console.log(`Reloading list due to refresh event`);
        this.aaayListService.refresh({});
      });
    }
  }

  ngAfterViewInit() {
    this.aaayListService.onRefresh().subscribe((list) => {
      this.aaayList = list;
      this.changeDetection.markForCheck();
    });
  }

}
