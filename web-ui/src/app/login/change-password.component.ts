import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import { ChangePasswordService } from './change-password.service';
import { AlertStatus } from '../widgets/index';

@Component({
    moduleId: module.id,
    templateUrl: 'change-password.component.html',
    styles: ['change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  alertStatus = new AlertStatus();
  model: any = {};
  loading = false;
  notSent = true;
  verificationCode: string = null;

  constructor(
      private activatedRoute: ActivatedRoute,
      private changePasswordService: ChangePasswordService
  ) { }

  ngOnInit() {
    this.notSent = true;
    this.verificationCode = null;
    this.activatedRoute.queryParams
    .subscribe(
      (params: Params) => {
        this.verificationCode = params['verification'];
      }
    );
  }

  changePassword() {
    this.changePasswordService.changePassword(this.model.username, this.model.password, this.verificationCode)
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
