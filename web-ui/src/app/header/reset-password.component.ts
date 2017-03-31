import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { MeService, ResetPasswordService } from '../_services/index';
import { LoginAccount } from '../_models/login-account';
import { AlertStatus } from '../widgets/index';

@Component({
    moduleId: module.id,
    templateUrl: 'reset-password.component.html',
    styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  alertStatus = new AlertStatus();
  hasUser: boolean;
  account: LoginAccount;
  imageUrl: string;
  notSent: boolean;

  constructor(
    private me: MeService,
    private resetPasswordService: ResetPasswordService
  ) {
    this.notSent = true;
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

  resetPassword() {
    if (this.account && this.account.user && this.account.user.username) {
      this.resetPasswordService.resetPassword(this.account.user.username, null)
      .subscribe(
        () => {
          this.alertStatus.success('A request has been sent to your email.  ' +
          'This provides a link where you can visit to change your password.');
          this.notSent = false;
        },
        (err) => {
          this.alertStatus.error(err);
        }
      );
    }
  }

  private setupHelper(account: LoginAccount) {
    if (account && account.user) {
      this.account = account;
      this.hasUser = true;
    } else {
      this.account = new LoginAccount();
      this.hasUser = false;
    }
  }
}
