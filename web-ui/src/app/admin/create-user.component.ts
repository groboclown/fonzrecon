import { Component, Input, ViewChild } from '@angular/core';
import {
  NgForm, FormGroup, FormControl, FormBuilder, Validators,
  CheckboxRequiredValidator, PatternValidator
} from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

import { User } from '../_models/user';
import { FormFeedbackStatus } from '../widgets/index';
import { UserService } from './user.service';

@Component({
    moduleId: module.id,
    templateUrl: 'create-user.component.html',
    styleUrls: ['../_style/forms.css']
})
export class CreateUserComponent {
  @ViewChild('userForm') userForm: NgForm;
  formFeedbackStatus = new FormFeedbackStatus<User>();
  id: string;
  user: any = {};
  loading = false;

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private userService: UserService,
      private formBuilder: FormBuilder
  ) {}

  submitCreateUser(event: Event, fieldValues, valid: boolean) {
    event.preventDefault();
    if (valid) {
      this.loading = true;
      this.userService.createUser({
        username: fieldValues.username,
        email: fieldValues.email,
        names: fieldValues.names.split(';').map((s: string) => s.trim()),
        pointsToAward: +fieldValues.pointsToAward,
        organization: fieldValues.organization,
        locale: fieldValues.locale
      })
      .subscribe(
        (p: any) => {
          this.loading = false;
          this.router.navigate(['/webui/admin/edit-user/', fieldValues.username]);
        },
        (err: any) => {
          this.loading = false;
          this.formFeedbackStatus.error(err);
        }
      );
    }
  }
}
