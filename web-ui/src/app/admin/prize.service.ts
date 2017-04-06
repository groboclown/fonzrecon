import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ApiService } from '../_services/index';
import { Prize } from '../_models/index';

@Injectable()
export class PrizeService {

  constructor(
      private api: ApiService
  ) {}

  getPrize(id: string): Observable<Prize> {
    return this.api.get('/api/v1/prizes/' + id)
      .map((response: Response) => {
        return Prize.parseFromJson(response.json());
      });
  }

  createPrize(prize: Prize): Observable<Prize> {
    return this.api.post('/api/v1/prizes', {
          name: prize.name,
          description: prize.description,
          referenceUrl: prize.referenceUrl,
          imageUri: prize.imageUri,
          purchasePoints: prize.purchasePoints,
          expires: prize.expires
        }
      ).map((response: Response) => {
        console.log(`DEBUG received response ${response.text()}`);
        return Prize.parseFromJson(response.json());
      });
  }


  updatePrize(prize: Prize): Observable<any> {
    return this.api.put('/api/v1/prizes/' + prize.id, {
          name: prize.name,
          description: prize.description,
          referenceUrl: prize.referenceUrl,
          imageUri: prize.imageUri,
          purchasePoints: prize.purchasePoints,
          expires: prize.expires
        }
      ).map((response: Response) => response.json());
  }


  expirePrize(id: string, when?: Date): Observable<any> {
    const exp = when || new Date();
    return this.api.put('/api/v1/prizes/' + id + '/expire', { when: exp })
      .map((response: Response) => {
        return { error: false, message: `Prize ${id} expired.` };
      });
  }


  sendImageFile(id: string, file: File): Observable<string> {
    return this.api.postFile('/api/v1/images/prize/' + id, file, 'image')
      .map((response: Response) => response.json().imageUri);
  }
}
