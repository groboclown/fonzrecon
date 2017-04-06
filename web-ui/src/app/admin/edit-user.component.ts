import { Component, Input, OnInit } from '@angular/core';
import {
  FormGroup, FormControl, FormBuilder, Validators,
  CheckboxRequiredValidator, PatternValidator
} from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/switchMap';

import { User } from '../_models/user';
import { UserDetailsService } from '../_services/index';
import { AlertStatus } from '../widgets/index';
import { UserService } from './user.service';

@Component({
    moduleId: module.id,
    templateUrl: 'edit-user.component.html',
    styles: ['edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  alertStatus = new AlertStatus();
  userForm: FormGroup;
  username: string;
  nameList: string;
  user: User = null;
  loading = false;

  constructor(
      private editUserService: UserService,
      private userDetailsService: UserDetailsService,
      private formBuilder: FormBuilder,
      private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.createForm();


    this.route.params
    .switchMap((params: Params) => {
      this.username = params['id'];
      return this.userDetailsService.getUser(this.username);
    })
    // TODO remove this duplication
    .subscribe(
      (user: User) => {
        this.loading = false;
        this.alertStatus.clear();
        this.updateUser(user);
      },
      (err: any) => {
        this.loading = false;
        this.alertStatus.error(err);
      }
    );
  }

  refresh() {
    return this.userDetailsService.getUser(this.username)
    .subscribe(
      (user: User) => {
        this.loading = false;
        this.alertStatus.clear();
        this.updateUser(user);
      },
      (err: any) => {
        this.loading = false;
        this.alertStatus.error(err);
      }
    );
  }

  private updateUser(user: User) {
    this.user = user;
    this.nameList = user.names.join('; ');
    this.userForm.controls['username'].setValue(user.username, { onlySelf: true });
    this.userForm.controls['receivedPointsToSpend'].setValue(+user.receivedPointsToSpend, { onlySelf: true });
    this.userForm.controls['active'].setValue(!!user.active, { onlySelf: true });
    this.userForm.controls['pointsToAward'].setValue(+user.pointsToAward, { onlySelf: true });
    this.userForm.controls['accountEmail'].setValue(user.accountEmail, { onlySelf: true });
    this.userForm.controls['organization'].setValue(user.organization, { onlySelf: true });
    this.userForm.controls['locale'].setValue(user.locale, { onlySelf: true });
    this.userForm.controls['role'].setValue(user.role, { onlySelf: true });
  }

  submit(event: Event, fieldValues, valid: boolean) {
    event.preventDefault();
    const start = new Subject<any>();
    let next = start.asObservable();
    let hasChanges = false;
    if (!this.userForm.controls['locale'].pristine ||
        !this.userForm.controls['organization'].pristine) {
      hasChanges = true;
      next = next.switchMap(() =>
        this.editUserService.updateDetails(
          this.username, fieldValues.locale, fieldValues.organization));
    }
    if (!this.userForm.controls['role'].pristine) {
      hasChanges = true;
      next = next.switchMap(() =>
        this.editUserService.updateUserRole(this.username, fieldValues.role));
    }
    if (!this.userForm.controls['pointsToAward'].pristine) {
      hasChanges = true;
      next = next.switchMap(() =>
        this.editUserService.updatePointsToAward(this.username, +fieldValues.pointsToAward));
    }

    if (hasChanges) {
      this.loading = true;
      next.subscribe(
        (u: any) => {
          this.loading = false;
          this.alertStatus.success('Updated');
        },
        (error: any) => {
          this.loading = false;
          this.alertStatus.error(error);
        }
      );
      start.next({});
    }
  }


  private createForm() {
    this.userForm = this.formBuilder.group({
      username: [{value: '', disabled: true}],
      receivedPointsToSpend: [{value: 0, disabled: true}],
      // nameList: [''],
      // active: ['', <any>new CheckboxRequiredValidator()],
      active: [{value: true, disabled: true}],
      // pointsToAward: ['', <any>Validators.required, <any>new PatternValidator()],
      pointsToAward: ['', <any>Validators.required],
      accountEmail: ['', <any>Validators.email],
      organization: ['', <any>Validators.required],
      locale: ['', <any>Validators.required],
      role: ['', <any>Validators.required]
    });
  }
}
