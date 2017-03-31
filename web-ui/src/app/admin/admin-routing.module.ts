import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminGuard } from './admin.guard';
import { AdminComponent } from './admin.component';
import { ManageUserListComponent } from './manage-user-list.component';
import { ImportUsersComponent } from './import-users.component';


const adminRoutes: Routes = [
  { path: 'webui/admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: 'webui/admin/users', component: ManageUserListComponent, canActivate: [AdminGuard] },
  { path: 'webui/admin/import-users', component: ImportUsersComponent, canActivate: [AdminGuard] }
];

@NgModule({
  imports: [
    RouterModule.forChild(adminRoutes)
  ],
  exports: [ RouterModule ]
})
export class AdminRoutingModule { }
