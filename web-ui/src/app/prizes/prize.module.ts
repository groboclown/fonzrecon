import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PagingModule } from '../paging/index';
import { WidgetsModule } from '../widgets/index';

import { PrizeRoutingModule } from './prize-routing.module';
import { PrizeListComponent } from './prize-list.component';
import { ViewPrizeComponent } from './view-prize.component';
import { PrizeService } from './prize.service';
import { PrizeListService } from './prize-list.service';
import { ClaimedPrizeListComponent } from './claimed-prize-list.component';
import { ClaimedPrizeListService } from './claimed-prize-list.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    PagingModule,
    WidgetsModule,
    PrizeRoutingModule
  ],
  declarations: [
    PrizeListComponent,
    ViewPrizeComponent,
    ClaimedPrizeListComponent
  ],
  exports: []
})
export class PrizeModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PrizeModule,

      // If private services are added, then inject them here:
      providers: [
        PrizeListService,
        PrizeService,
        ClaimedPrizeListService
      ]
    };
  }
}
