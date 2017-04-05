import { Component, OnInit, Input, Optional } from '@angular/core';

import {
  FormGroup, FormControl, NgForm, NgControl, NgModel
} from '@angular/forms';
import {
  FormFeedbackError, FormFeedbackResult, FormFeedbackStatus, ParameterError
} from './form-feedback.model';

@Component({
    moduleId: module.id,
    selector: 'app-form-feedback',
    templateUrl: 'form-feedback.component.html',
    styleUrls: ['../_style/forms.css']
})
export class FormFeedbackComponent<T> implements OnInit {
  @Input() formFeedbackStatus: FormFeedbackStatus<T>;
  @Input() set form(f: NgForm) {
    this._form = f.form;
  };
  @Optional() @Input() generalServerError;
  @Optional() @Input() generalServerSuccess;
  _form: FormGroup;

  message: string = null;
  isError = false;
  isSuccess = false;

  ngOnInit() {
    this.formFeedbackStatus._onClearSent()
    .subscribe((x?: boolean) => this.clearStatus());

    this.formFeedbackStatus._onErrorSent()
    .subscribe((err: FormFeedbackError) => this.errorStatus(err));

    this.formFeedbackStatus._onSuccessSent()
    .subscribe((status: FormFeedbackResult<T>) => this.successStatus(status));
  }

  clearStatus() {
    this.isSuccess = false;
    this.isError = false;
    this.message = null;
  }

  errorStatus(err: FormFeedbackError) {
    this.isError = true;
    this.isSuccess = false;
    this.message = err.message || this.generalServerError || 'Failed to submit';
    for (let i = 0; i < err.parameters.length; i++) {
      const p: ParameterError = err.parameters[i];
      if (this._form.contains(p.key)) {
        console.log(`DEBUG setting error for control ${p.key}`);
        this._form.controls[p.key].setErrors({
          server: p.message
        });
      } else {
        console.log(`DEBUG unknown form component for ${p.key}: ${p.message}`);
      }
    }
  }

  successStatus(status: FormFeedbackResult<T>) {
    this.isError = false;
    this.isSuccess = true;
    this.message = status.message || this.generalServerSuccess || 'Success';
    // TODO set the values in the form to
    // match up with the results.
  }
}
