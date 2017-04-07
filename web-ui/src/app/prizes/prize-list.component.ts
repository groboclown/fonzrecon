import {
  Component, OnInit, AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { Prize, LoginAccount } from '../_models/index';
import { PrizeList } from './prize-list.model';
import { PrizeListService } from './prize-list.service';
import { PrizeService } from './prize.service';
import { AlertStatus } from '../widgets/index';


@Component({
    moduleId: module.id,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'prize-list.component.html',
    styleUrls: ['./prize-list.component.css']
})
export class PrizeListComponent implements AfterViewInit, OnInit {
  filter: {} = {};
  prizeList: PrizeList = new PrizeList();
  alertStatus = new AlertStatus();
  purchaseStats: {};
  account: LoginAccount;
  loading = false;

  constructor(
      private prizeListService: PrizeListService,
      private changeDetection: ChangeDetectorRef,
      private prizeService: PrizeService,

  ) {}

  ngOnInit() {
    this.prizeService.onLoginAccountUpdate()
    .subscribe(
      (account: LoginAccount) => {
        this.account = account;
      },
      (err: any) => {
        this.alertStatus.error(err);
      }
    );
  }

  ngAfterViewInit() {
    this.prizeListService.onRefresh().subscribe((list) => {
      this.prizeList = list;
      this.purchaseStats = {};
      this.changeDetection.markForCheck();
    });
  }

  hasSufficientPoints(prize: Prize): boolean {
    if (prize && this.account) {
      return prize.purchasePoints <= this.account.user.receivedPointsToSpend;
    }
    return false;
  }

  purchase(prize: Prize, index: number): void {
    console.log(`DEBUG buying ${prize.id}`);
    this.prizeService.purchasePrize(prize)
    .subscribe(
      (claimedInfo) => {
        this.purchaseStats = {};
        this.purchaseStats[prize.id] = 'ok';
        this.changeDetection.markForCheck();
      },
      (err: any) => {
        this.purchaseStats[prize.id] = err.message;
        this.alertStatus.error(err);
        this.changeDetection.markForCheck();
      }
    );
  }

  toImageUrl(prize: Prize): string {
    return this.prizeService.toImageUrl(prize);
  }
}
