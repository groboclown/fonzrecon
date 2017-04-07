import {
  Component, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { Prize, LoginAccount } from '../_models/index';
// import { ViewPrizeService } from './view-prize.service';
import { MeService, SiteService } from '../_services/index';
import { AlertStatus } from '../widgets/index';


@Component({
    moduleId: module.id,
    templateUrl: 'view-prize.component.html',
    // styleUrls: ['./view-prize.component.css']
})
export class ViewPrizeComponent implements OnInit {
  prize: Prize = new Prize();
  alertStatus = new AlertStatus();
  account: LoginAccount;

  constructor(
      private siteService: SiteService,
      private meService: MeService
  ) {}

  ngOnInit() {
    this.meService.getLoginAccount()
    .subscribe((account: LoginAccount) => {
      this.account = account;
    });
  }

  toImageUrl(prize: Prize): string {
    return this.siteService.toImageUrl(prize.imageUri);
  }
}
