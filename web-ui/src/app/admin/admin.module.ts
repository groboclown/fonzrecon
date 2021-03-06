import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PagingModule } from '../paging/index';
import { WidgetsModule } from '../widgets/index';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminGuard } from './admin.guard';
import { ManageUserListComponent } from './manage-user-list.component';
import { ManageUserListService } from './manage-user-list.service';
import { ImportUsersComponent } from './import-users.component';
import { ImportUsersService } from './import-users.service';
import { SetGivingPointsComponent } from './set-giving-points.component';
import { SetGivingPointsService } from './set-giving-points.service';
import { CreateUserComponent } from './create-user.component';
import { EditUserComponent } from './edit-user.component';
import { UserService } from './user.service';
import { ManagePrizeListComponent } from './manage-prize-list.component';
import { ManagePrizeListService } from './manage-prize-list.service';
import { CreatePrizeComponent } from './create-prize.component';
import { EditPrizeComponent } from './edit-prize.component';
import { PrizeService } from './prize.service';
import { SiteSettingsComponent } from './site-settings.component';
import { SiteSettingsService } from './site-settings.service';
import { SiteSettingKeyFormComponent } from './site-setting-key-form.component';
import { SiteSettingKeyFormService } from './site-setting-key-form.service';

// TODO make this lazy loaded, as only administrators will ever see this
// module.

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    PagingModule,
    WidgetsModule,
    AdminRoutingModule
  ],
  declarations: [
    AdminComponent,
    ManageUserListComponent,
    ImportUsersComponent,
    SetGivingPointsComponent,
    CreateUserComponent,
    EditUserComponent,
    ManagePrizeListComponent,
    CreatePrizeComponent,
    EditPrizeComponent,
    SiteSettingsComponent,
    SiteSettingKeyFormComponent
  ],
  exports: [
    AdminComponent
    // ManageUserListComponent cannot be used outside this module.
    // ImportUsersComponent cannot be used outside this module.
  ]
})
export class AdminModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AdminModule,

      // If private services are added, then inject them here:
      providers: [
        ImportUsersService,
        ManageUserListService,
        AdminGuard,
        SetGivingPointsService,
        UserService,
        ManagePrizeListService,
        SiteSettingsService,
        SiteSettingKeyFormService,
        PrizeService
      ]
    };
  }
}
