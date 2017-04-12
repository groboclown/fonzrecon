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

import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/operator/flatMap';
import 'rxjs/add/observable/forkJoin';


@Component({
    moduleId: module.id,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'claimed-prize-list.component.html',
    styleUrls: ['./claimed-prize-list.component.css']
})
export class ClaimedPrizeListComponent implements AfterViewInit {
  filter: {} = {};
  refuseFieldShown = null;
  validateLoading = {};
  detailsLoading = {};
  prizeList: ClaimedPrizeList = new ClaimedPrizeList();
  alertStatus = new AlertStatus();
  loading = false;

  constructor(
      private claimedPrizeListService: ClaimedPrizeListService,
      private siteService: SiteService,
      private changeDetection: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.claimedPrizeListService.onRefresh()
    .map((list) => {
      this.prizeList = list;
      this.changeDetection.markForCheck();
      return list.results;
    })
    .flatMap(
      (claimedPrizes: ClaimedPrize[]) => {
        // TODO this needs to be correctly handling the loop and multiple
        // observable return values.  This shouldnt' need to resort to Promises.
        const joins: Observable<ClaimedPrize>[] = [];
        for (let i = 0; i < claimedPrizes.length; i++) {
          if (claimedPrizes[i].claimAllowed === null) {
            this.detailsLoading[claimedPrizes[i].id] = true;
            joins.push(this.claimedPrizeListService.loadClaimedPrizeDetails(claimedPrizes[i]));
          }
        }
        return Observable.forkJoin(joins);
      })
    .subscribe(
      (cp: ClaimedPrize[]) => {
        for (let i = 0; i < cp.length; i++) {
          this.detailsLoading[cp[i].id] = false;
        }
        this.changeDetection.markForCheck();
      },
      (err: any) => {
        this.alertStatus.error(err);
      }
    );
  }

  canValidateClaim(claimedPrize: ClaimedPrize): boolean {
    return this.claimedPrizeListService.canValidateClaim(claimedPrize);
  }

  allowClaim(claimedPrize: ClaimedPrize): void {
    this.validateLoading[claimedPrize.id] = true;
    this.claimedPrizeListService.allowClaim(claimedPrize)
    .subscribe(
      (cprize: ClaimedPrize) => {
        this.validateLoading[claimedPrize.id] = false;
        if (cprize) {
          this.changeDetection.markForCheck();
        }
      },
      (err: any) => {
        this.validateLoading[claimedPrize.id] = false;
        this.alertStatus.error(err);
      }
    );
  }

  showRefuseForm(claimedPrize: ClaimedPrize): void {
    if (claimedPrize && claimedPrize.id !== this.refuseFieldShown) {
      this.refuseFieldShown = claimedPrize.id;
    } else {
      this.refuseFieldShown = null;
    }
  }

  refuseClaim(claimedPrize: ClaimedPrize): void {
    this.validateLoading[claimedPrize.id] = false;
    this.claimedPrizeListService.refuseClaim(claimedPrize, 'TODO replace with real reason')
    .subscribe(
      (cprize: ClaimedPrize) => {
        if (cprize) {
          this.validateLoading[claimedPrize.id] = false;
          this.changeDetection.markForCheck();
        }
      },
      (err: any) => {
        this.validateLoading[claimedPrize.id] = false;
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
