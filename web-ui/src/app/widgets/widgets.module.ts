import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlertComponent } from './alert.component';
import { ParameterErrorComponent } from './parameter-error.component';
import { FormFeedbackComponent } from './form-feedback.component';
import { FormFieldErrorComponent } from './form-field-error.component';
import { LoadButtonComponent } from './load-button.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    LoadButtonComponent,
    AlertComponent,
    ParameterErrorComponent,
    FormFeedbackComponent,
    FormFieldErrorComponent
  ],
  exports: [
    LoadButtonComponent,
    AlertComponent,
    ParameterErrorComponent,
    FormFeedbackComponent,
    FormFieldErrorComponent
  ]
})
export class WidgetsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: WidgetsModule
    };
  }
}
