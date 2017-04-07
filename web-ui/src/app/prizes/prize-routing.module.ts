import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PrizeListComponent } from './prize-list.component';
import { ViewPrizeComponent } from './view-prize.component';

const prizeRoutes: Routes = [
  { path: 'webui/prizes', component: PrizeListComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(prizeRoutes)
  ],
  exports: [ RouterModule ]
})
export class PrizeRoutingModule { }
