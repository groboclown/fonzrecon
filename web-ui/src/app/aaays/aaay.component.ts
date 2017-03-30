import { Component, Input, OnInit } from '@angular/core';

import { Aaay } from './aaay.model';

@Component({
    moduleId: module.id,
    selector: 'app-aaay',
    templateUrl: 'aaay.component.html'
})
export class AaayComponent {
  @Input() aaay: Aaay = new Aaay();

  hasThumbsUp(): boolean {
    return this.aaay.thumbsUps && this.aaay.thumbsUps.length > 0;
  }
}
