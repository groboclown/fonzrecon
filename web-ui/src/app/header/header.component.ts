import {
  Component, OnInit, AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,

  // animation members
  trigger, state, animate, transition, style
} from '@angular/core';

import { Site, LoginAccount } from '../_models/index';

import { SiteService, MeService } from '../_services/index';

@Component({
    moduleId: module.id,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-header',
    templateUrl: 'header.component.html',
    styleUrls: ['./header.component.css'],

    animations: [
      trigger('userDropDownState', [
        state('true', style({ })),
        state('false', style({
          maxHeight: 0,
          padding: 0,
          display: 'none'
        })),
        transition('* => *', animate('300ms ease-in-out'))
      ])
    ]
})
export class HeaderComponent implements OnInit, AfterViewInit {
  private site: Site = new Site();
  private loginAccount: LoginAccount = new LoginAccount();

  shouldToggleUserDropDown = false;

  constructor(
      private siteService: SiteService,
      private meService: MeService,
      private changeDetection: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.siteService.getAsync()
    .subscribe((response: Site) => {
      this.site = response;
      this.changeDetection.detectChanges();
    });
    this.meService.getLoginAccount()
    .subscribe((response: LoginAccount) => {
      if (response !== null && response !== undefined) {
        console.log(`DEBUG header loaded login account data ${response.username}`);
        this.loginAccount = response;
      } else {
        console.log(`DEBUG header loaded login account data [null]`);
        this.loginAccount = new LoginAccount();
      }
      this.changeDetection.detectChanges();
    });
  }

  ngAfterViewInit() {
    // this.changeDetection.detectChanges();
  }

  imageUrl(): string {
    if (this.loginAccount && this.loginAccount.user) {
      return this.siteService.toImageUrl(this.loginAccount.user.imageUri);
    }
    return null;
  }

  isAuthenticated(): Boolean {
    return this.loginAccount && this.loginAccount.isAuthenticated();
  }

  isAdmin(): Boolean {
    return this.loginAccount && this.loginAccount.isAdmin;
  }

  onToggleUserDropDown() {
    console.log(`DEBUG toggled`);
    this.shouldToggleUserDropDown = !this.shouldToggleUserDropDown;
  }
}
