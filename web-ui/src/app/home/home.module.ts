import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AaaysModule } from '../aaays/index';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    HomeRoutingModule,
    AaaysModule
  ],
  declarations: [
    HomeComponent
  ],
  exports: [
    // This is private, and shouldn't be used outside this module.
    // HomeComponent
  ]
})
export class HomeModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: HomeModule,

      // If private services are added, then inject them here:
      providers: []
    };
  }
}
