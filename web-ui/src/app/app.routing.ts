import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './_guards/index';

const appRoutes: Routes = [

  // Anything else, redirect to home
  { path: '**',  redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
