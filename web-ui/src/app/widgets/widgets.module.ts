import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlertComponent } from './alert.component';
import { ParameterErrorComponent } from './parameter-error.component';
import { LoadButtonComponent } from './load-button.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    LoadButtonComponent,
    AlertComponent,
    ParameterErrorComponent
  ],
  exports: [
    LoadButtonComponent,
    AlertComponent,
    ParameterErrorComponent
  ]
})
export class WidgetsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: WidgetsModule
    };
  }
}
