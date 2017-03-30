import { Component, OnInit } from '@angular/core';

import { AaayList } from './aaay-list.model';
import { AaayListService } from './aaay-list.service';

@Component({
    moduleId: module.id,
    selector: 'app-aaay-list',
    templateUrl: 'aaay-list.component.html'
})
export class AaayListComponent {
  aaayList: AaayList = new AaayList();

  constructor(private aaayListService: AaayListService) {
    this.aaayListService.onRefresh().subscribe((list) => {
      this.aaayList = list;
    });
  }

}
