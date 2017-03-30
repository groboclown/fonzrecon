import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../_guards/index';
import { HomeComponent } from './home.component';

const homeRoutes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    RouterModule.forChild(homeRoutes)
  ],
  exports: [ RouterModule ]
})
export class HomeRoutingModule { }
