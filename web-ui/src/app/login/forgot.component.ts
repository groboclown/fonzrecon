import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import { ResetPasswordService } from './reset-password.service';
import { AlertStatus } from '../widgets/index';

@Component({
    moduleId: module.id,
    templateUrl: 'forgot.component.html'
})
export class ForgotComponent implements OnInit {
  alertStatus = new AlertStatus();
  model: any = {};
  loading = false;
  notSent = true;

  constructor(
      private forgotService: ResetPasswordService
  ) { }

  ngOnInit() {
    this.notSent = true;
  }

  resetPassword() {
    this.forgotService.resetPassword(this.model.username, this.model.email)
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
