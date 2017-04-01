import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ApiService, MeService } from '../_services/index';
import { LoginAccount } from '../_models/login-account';

@Component({
    moduleId: module.id,
    templateUrl: 'me.component.html',
    styleUrls: ['./me.component.css'],
})
export class MeComponent implements OnInit {
  hasAccount: boolean;
  hasUser: boolean;
  account: LoginAccount;
  imageUrl: string;

  constructor(
    private me: MeService,
    private api: ApiService
  ) {
    this.setupHelper(null);
  }

  ngOnInit() {
    this.me.getLoginAccount()
    .subscribe(
      (account: LoginAccount) => {
        this.setupHelper(account);
      },
      (err) => {
        this.setupHelper(null);
      }
    );
  }

  refresh() {
    this.me.refresh();
  }

  private setupHelper(account: LoginAccount) {
    if (account) {
      this.account = account;
      this.hasAccount = true;
      if (account.user) {
        this.hasUser = true;
        this.imageUrl = this.api.toUrl(account.user.imageUri);
      } else {
        this.hasUser = false;
      }
    } else {
      this.account = new LoginAccount();
      this.hasAccount = false;
      this.imageUrl = null;
      this.hasUser = false;
    }
  }
}
