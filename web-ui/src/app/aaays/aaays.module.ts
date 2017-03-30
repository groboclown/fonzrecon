import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { AaaysRoutingModule } from './aaays-routing.module';
import { AaayListComponent } from './aaay-list.component';
import { AaayComponent } from './aaay.component';
import { AaayListService } from './aaay-list.service';
import { CreateAaayService } from './create-aaay.service';
import { CreateAaayComponent } from './create-aaay.component';

import { PagedComponent } from '../_directives/index';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    AaaysRoutingModule,
  ],
  declarations: [
    PagedComponent,

    AaayListComponent,
    AaayComponent,
    CreateAaayComponent
  ],
  exports: [
    PagedComponent,

    AaayListComponent,
    AaayComponent
  ]
})
export class AaaysModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AaaysModule,

      // If private services are added, then inject them here:
      providers: [
        AaayListService,
        CreateAaayService
      ]
    };
  }
}
