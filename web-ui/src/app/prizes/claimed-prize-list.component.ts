import {
  Component, AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { LoginAccount } from '../_models/index';
import { SiteService } from '../_services/index';
import { ClaimedPrize } from './claimed-prize.model';
import { ClaimedPrizeList } from './claimed-prize-list.model';
import { ClaimedPrizeListService } from './claimed-prize-list.service';
import { AlertStatus } from '../widgets/index';


@Component({
    moduleId: module.id,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'claimed-prize-list.component.html',
    styleUrls: ['./claimed-prize-list.component.css']
})
export class ClaimedPrizeListComponent implements AfterViewInit {
  filter: {} = {};
  prizeList: ClaimedPrizeList = new ClaimedPrizeList();
  alertStatus = new AlertStatus();
  loading = false;

  constructor(
      private claimedPrizeListService: ClaimedPrizeListService,
      private siteService: SiteService,
      private changeDetection: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.claimedPrizeListService.onRefresh().subscribe((list) => {
      this.prizeList = list;
      this.changeDetection.markForCheck();
    });
  }

  canValidateClaims(): boolean {
    return this.claimedPrizeListService.canValidateClaims();
  }

  allowClaim(claimedPrize: ClaimedPrize): void {
    this.claimedPrizeListService.allowClaim(claimedPrize)
    .subscribe(
      (cprize: ClaimedPrize) => {
        if (cprize) {
          this.changeDetection.markForCheck();
        }
      },
      (err: any) => {
        this.alertStatus.error(err);
      }
    );
  }

  refuseClaim(claimedPrize: ClaimedPrize): void {
    this.claimedPrizeListService.refuseClaim(claimedPrize, 'TODO replace with real reason')
    .subscribe(
      (cprize: ClaimedPrize) => {
        if (cprize) {
          this.changeDetection.markForCheck();
        }
      },
      (err: any) => {
        this.alertStatus.error(err);
      }
    );
  }


  toImageUrl(claimedPrize: ClaimedPrize): string {
    if (claimedPrize && claimedPrize.prize) {
      return this.siteService.toImageUrl(claimedPrize.prize.imageUri);
    }
    return null;
  }
}
