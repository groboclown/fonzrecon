import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { HeaderRoutingModule } from './header-routing.module';
import { HeaderComponent } from './header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    HeaderRoutingModule
  ],
  declarations: [
    HeaderComponent
  ],
  exports: [
    HeaderComponent
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
