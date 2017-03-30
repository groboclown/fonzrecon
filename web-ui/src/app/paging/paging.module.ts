import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertModule } from '../alert/index';

import { PagingComponent } from './paging.component';
import { PagingService } from './paging.service';

@NgModule({
  imports: [
    CommonModule,
    AlertModule
  ],
  declarations: [
    PagingComponent
  ],
  exports: [
    PagingComponent
  ]
  // There is no service.  Services must be subclassed.
})
export class PagingModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PagingModule
    };
  }
}
