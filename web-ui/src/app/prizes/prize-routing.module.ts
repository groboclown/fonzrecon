import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PrizeListComponent } from './prize-list.component';
import { ViewPrizeComponent } from './view-prize.component';
import { ClaimedPrizeListComponent } from './claimed-prize-list.component';

const prizeRoutes: Routes = [
  { path: 'webui/prizes', component: PrizeListComponent },
  { path: 'webui/claimed-prizes', component: ClaimedPrizeListComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(prizeRoutes)
  ],
  exports: [ RouterModule ]
})
export class PrizeRoutingModule { }
