import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login.component';
import { ForgotComponent } from './forgot.component';
import { ChangePasswordComponent } from './change-password.component';

const loginRoutes: Routes = [
  { path: 'webui/login/change', component: ChangePasswordComponent },
  { path: 'webui/login/forgot', component: ForgotComponent },
  { path: 'webui/login', component: LoginComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(loginRoutes)
  ],
  exports: [ RouterModule ]
})
export class LoginRoutingModule { }
