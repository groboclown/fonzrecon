import { Component, Input, OnInit } from '@angular/core';
import {
  FormGroup, FormControl, FormBuilder, Validators,
  CheckboxRequiredValidator, PatternValidator
} from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

import { User } from '../_models/user';
import { UserDetailsService } from '../_services/index';
import { AlertStatus } from '../widgets/index';
import { EditUserService } from './edit-user.service';

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
      private editUserService: EditUserService,
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
    /*
    const model = {
      username: user.username || this.username || '',
      receivedPointsToSpend: user.receivedPointsToSpend || 0,
      active: !!user.active || false,
      pointsToAward: user.pointsToAward || 0,
      accountEmail: user.accountEmail || 'a@b.c',
      organization: user.organization || '',
      role: user.role || 'USER'
    };
    this.userForm.setValue(user, { onlySelf: true });
    */
    this.userForm.controls['username'].setValue(user.username, { onlySelf: true });
    this.userForm.controls['receivedPointsToSpend'].setValue(+user.receivedPointsToSpend, { onlySelf: true });
    this.userForm.controls['active'].setValue(!!user.active, { onlySelf: true });
    this.userForm.controls['pointsToAward'].setValue(+user.pointsToAward, { onlySelf: true });
    this.userForm.controls['accountEmail'].setValue(user.accountEmail, { onlySelf: true });
    this.userForm.controls['organization'].setValue(user.organization, { onlySelf: true });
    this.userForm.controls['role'].setValue(user.role, { onlySelf: true });
  }

  submit(fieldValues, valid: boolean) {
    /*
    this.loading = true;
    const pub = (this.model.public === false) ? false : true;
    this.editUserService.submit({
      points: points,
      to: us,
      public: pub,
      comment: this.model.comment,
      tags: ts
    })
    .subscribe(
      (aaay: Aaay) => {
        this.alertStatus.success(`You just gave an Aaay!`);
        if (this.onChangeEvent) {
          this.onChangeEvent.next({ aaay: aaay });
        }
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        this.alertStatus.error(error);
      }
    );
    */
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
      role: ['', <any>Validators.required]
    });
  }
}
