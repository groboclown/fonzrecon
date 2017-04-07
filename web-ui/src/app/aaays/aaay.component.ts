import { Component, Input, OnInit } from '@angular/core';

import { SiteService } from '../_services/site.service';
import { Aaay } from './aaay.model';
import { User } from '../_models/index';

@Component({
    moduleId: module.id,
    selector: 'app-aaay',
    templateUrl: 'aaay.component.html',
    styleUrls: ['./aaay.component.css']
})
export class AaayComponent {
  @Input() aaay: Aaay = new Aaay();

  constructor(
      private siteService: SiteService
  ) {}

  hasThumbsUp(): boolean {
    return this.aaay.thumbsUps && this.aaay.thumbsUps.length > 0;
  }

  userImageUrl(user: User): string {
    if (!user) {
      return null;
    }
    return this.siteService.toImageUrl(user.imageUri);
  }
}
