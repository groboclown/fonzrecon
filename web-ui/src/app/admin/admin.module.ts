import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { PagingModule } from '../paging/index';
import { WidgetsModule } from '../widgets/index';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { ManageUserListComponent } from './manage-user-list.component';
import { ManageUserListService } from './manage-user-list.service';
import { ImportUsersComponent } from './import-users.component';
import { ImportUsersService } from './import-users.service';
import { AdminGuard } from './admin.guard';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    PagingModule,
    WidgetsModule,
    AdminRoutingModule
  ],
  declarations: [
    AdminComponent,
    ManageUserListComponent,
    ImportUsersComponent
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
        AdminGuard,
        ManageUserListService,
        ImportUsersService
      ]
    };
  }
}
