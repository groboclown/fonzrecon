import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './admin.component';
import { AdminGuard } from './admin.guard';
import { ManageUserListComponent } from './manage-user-list.component';
import { ImportUsersComponent } from './import-users.component';
import { SetGivingPointsComponent } from './set-giving-points.component';
import { CreateUserComponent } from './create-user.component';
import { EditUserComponent } from './edit-user.component';
import { ManagePrizeListComponent } from './manage-prize-list.component';
import { CreatePrizeComponent } from './create-prize.component';
import { EditPrizeComponent } from './edit-prize.component';
import { SiteSettingsComponent } from './site-settings.component';

const adminRoutes: Routes = [
  { path: 'webui/admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: 'webui/admin/users', component: ManageUserListComponent, canActivate: [AdminGuard] },
  { path: 'webui/admin/create-user', component: CreateUserComponent, canActivate: [AdminGuard] },
  { path: 'webui/admin/edit-user/:id', component: EditUserComponent, canActivate: [AdminGuard] },
  { path: 'webui/admin/import-users', component: ImportUsersComponent, canActivate: [AdminGuard] },
  { path: 'webui/admin/reset-points-to-award', component: SetGivingPointsComponent, canActivate: [AdminGuard] },
  { path: 'webui/admin/site-settings', component: SiteSettingsComponent, canActivate: [AdminGuard] },
  { path: 'webui/admin/prizes', component: ManagePrizeListComponent, canActivate: [AdminGuard] },
  { path: 'webui/admin/create-prize', component: CreatePrizeComponent, canActivate: [AdminGuard] },
  { path: 'webui/admin/edit-prize/:id', component: EditPrizeComponent, canActivate: [AdminGuard] }
];

@NgModule({
  imports: [
    RouterModule.forChild(adminRoutes)
  ],
  exports: [ RouterModule ]
})
export class AdminRoutingModule { }
