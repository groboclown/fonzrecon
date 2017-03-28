import { Component, OnInit } from '@angular/core';

import { Site, LoginAccount } from '../_models/index';

import { SiteService, MeService } from '../_services/index';

@Component({
    moduleId: module.id,
    selector: 'app-header',
    templateUrl: 'header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  private site: Site = new Site();
  private loginAccount: LoginAccount = new LoginAccount();

  constructor(
    private siteService: SiteService,
    private meService: MeService) { }

    ngOnInit() {
      this.siteService.getAsync()
        .subscribe((response: Site) => {
          this.site = response;
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
        });
    }

  isAuthenticated(): Boolean {
    return this.loginAccount && this.loginAccount.isAuthenticated();
  }
}
