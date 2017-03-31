import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { WidgetsModule } from '../widgets/index';

import { HeaderRoutingModule } from './header-routing.module';
import { HeaderComponent } from './header.component';
import { MeComponent } from './me.component';
import { ResetPasswordComponent } from './reset-password.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    WidgetsModule,

    HeaderRoutingModule
  ],
  declarations: [
    HeaderComponent,
    MeComponent,
    ResetPasswordComponent
  ],
  exports: [
    HeaderComponent

    // Do not export:
    // MeComponent
  ]
})
export class HeaderModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: HeaderModule,

      // If private services are added, then inject them here:
      providers: []
    };
  }
}
