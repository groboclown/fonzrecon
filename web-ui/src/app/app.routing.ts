import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './_guards/index';
import { LoginRoutingModule } from './login/index';
import { HomeComponent } from './home/index';

const appRoutes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },

  // Anything else, redirect to home
  { path: '**',  redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
