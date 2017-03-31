import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HeaderComponent } from './header.component';
import { MeComponent } from './me.component';
import { ResetPasswordComponent } from './reset-password.component';

const headerRoutes: Routes = [
  { path: 'webui/header/me', component: MeComponent },
  { path: 'webui/header/reset-password', component: ResetPasswordComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(headerRoutes)
  ],
  exports: [ RouterModule ]
})
export class HeaderRoutingModule { }
