import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../_guards/index';
import { AaayListComponent } from './aaay-list.component';


const aaaysRoutes: Routes = [
  { path: 'webui/aaays', component: AaayListComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    RouterModule.forChild(aaaysRoutes)
  ],
  exports: [ RouterModule ]
})
export class AaaysRoutingModule { }
