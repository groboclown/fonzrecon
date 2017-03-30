import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HeaderComponent } from './header.component';

const headerRoutes: Routes = [
  { path: 'header-x', component: HeaderComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(headerRoutes)
  ],
  exports: [ RouterModule ]
})
export class HeaderRoutingModule { }
