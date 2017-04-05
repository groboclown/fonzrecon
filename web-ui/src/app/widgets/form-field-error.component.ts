import { Component, OnInit, Input, Optional } from '@angular/core';

import { NgModel } from '@angular/forms';

@Component({
    moduleId: module.id,
    selector: 'app-form-error',
    templateUrl: 'form-field-error.component.html',
    styleUrls: ['../_style/forms.css']
})
export class FormFieldErrorComponent implements OnInit {
  @Input() model: NgModel;
  @Optional() @Input() validation: string;

  ngOnInit() {
  }

  clearMessage(): void {
  }

  hasNoError(): boolean {
    return this.model.valid || this.model.pristine;
  }

  hasServerError(): boolean {
    return this.model &&
      this.model.errors && this.model.errors.server;
  }

  getServerError(): string {
    if (this.model && this.model.errors && this.model.errors.server) {
      const v = this.model.errors.server;
      if (typeof(v) === 'string') {
        return v;
      }
      return JSON.stringify(v);
    }
    return 'uknown error';
  }

  hasGeneralError(): boolean {
    return !this.hasServerError() && !!this.model &&
      !!this.model.errors;
  }

  getGeneralErrors(): string[] {
    const ret = [];
    for (const k in this.model.errors) {
      if (this.model.errors.hasOwnProperty(k)) {
        const v = this.model.errors[k];
        if (v === true) {
          ret.push(k);
        } else if (v) {
          ret.push(v);
        } else {
          ret.push(k);
        }
      }
    }
    return ret;
  }

  hasValidationError(): boolean {
    return !this.model.valid && !this.model.errors;
  }

  getValidationError(): string {
    return this.validation || 'Invalid value';
  }
}
