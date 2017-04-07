import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ApiService, MeService, SiteService } from '../_services/index';
import { Prize, LoginAccount } from '../_models/index';

@Injectable()
export class PrizeService {
  constructor(
      private api: ApiService,
      private me: MeService,
      private site: SiteService
  ) {}

  getPrize(id: string): Observable<Prize> {
    throw new Error();
  }

  onLoginAccountUpdate(): Observable<LoginAccount> {
    return this.me.getLoginAccount();
  }


  toImageUrl(prize: Prize): string {
    return this.site.toImageUrl(prize.imageUri);
  }


  purchasePrize(prize: Prize): Observable<any> {
    return this.api.post('/api/v1/claimed-prizes', { prizeChoiceId: prize.id })
    .map((response: Response) => {
      this.me.refresh();
      return response.json();
    });
  }
}
