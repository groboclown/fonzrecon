import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './_guards/index';
import { LoginComponent } from './login/index';
import { HomeComponent } from './home/index';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },

  // Anything else, redirect to home
  { path: '**',  redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
