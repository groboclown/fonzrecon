import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HeaderComponent } from './header.component';
import { MeComponent } from './me.component';

const headerRoutes: Routes = [
  { path: 'webui/header-x', component: HeaderComponent },
  { path: 'webui/header/me', component: MeComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(headerRoutes)
  ],
  exports: [ RouterModule ]
})
export class HeaderRoutingModule { }
