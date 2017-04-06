import {
  Component, OnInit, AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { Prize } from '../_models/prize';
import { ManagePrizeList } from './manage-prize-list.model';
import { ManagePrizeListService } from './manage-prize-list.service';
import { SiteService } from '../_services/index';
import { AlertStatus } from '../widgets/index';


@Component({
    moduleId: module.id,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-manage-prize-list',
    templateUrl: 'manage-prize-list.component.html',
    styleUrls: ['./manage-prize-list.component.css']
})
export class ManagePrizeListComponent implements AfterViewInit {
  filter: { all: boolean } = { all: false };
  prizeList: ManagePrizeList = new ManagePrizeList();
  private alertStatus = new AlertStatus();

  constructor(
      private prizeListService: ManagePrizeListService,
      private siteService: SiteService,
      private changeDetection: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.prizeListService.onRefresh().subscribe((list) => {
      this.prizeList = list;
      this.changeDetection.markForCheck();
    });
  }

/*
  expirePrize(event, index, user) {
    this.prizeListService.expirePrize(user.username)
    .subscribe(
      (message: any) => {
        this.alertStatus.success(message.message);
      },
      (error: any) => {
        this.alertStatus.error(error);
      }
    );
  }
*/

  toImageUrl(prize: Prize): string {
    return this.siteService.toImageUrl(prize.imageUri);
  }
}
