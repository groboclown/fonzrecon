import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminGuard } from './admin.guard';
import { AdminComponent } from './admin.component';
import { ManageUserListComponent } from './manage-user-list.component';
import { ImportUsersComponent } from './import-users.component';


const adminRoutes: Routes = [
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: 'admin/users', component: ManageUserListComponent, canActivate: [AdminGuard] },
  { path: 'admin/import-users', component: ImportUsersComponent, canActivate: [AdminGuard] }
];

@NgModule({
  imports: [
    RouterModule.forChild(adminRoutes)
  ],
  exports: [ RouterModule ]
})
export class AdminRoutingModule { }
