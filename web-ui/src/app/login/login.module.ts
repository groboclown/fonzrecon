import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WidgetsModule } from '../widgets/index';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { LoginService } from './login.service';
import { ForgotComponent } from './forgot.component';
import { ResetPasswordService } from './reset-password.service';
import { ChangePasswordComponent } from './change-password.component';
import { ChangePasswordService } from './change-password.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    WidgetsModule,
    LoginRoutingModule
  ],
  declarations: [
    LoginComponent,
    ForgotComponent,
    ChangePasswordComponent
  ],
  providers: [
    // Public service.  Maybe move elsewhere?
    ResetPasswordService
  ]
})
export class LoginModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: LoginModule,

      // If private services are added, then inject them here:
      providers: [
        LoginService,
        ChangePasswordService
      ]
    };
  }
}
