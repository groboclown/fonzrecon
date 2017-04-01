import {
  Component, OnInit, Injectable
} from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ApiService } from '../_services/index';

@Injectable()
export class SetGivingPointsService {

  constructor(
    private api: ApiService
  ) {}

  setGivingPoints(pointTotal: number): Observable<any> {
    return this.api.put('api/v1/users/reset-points-to-award', {
      points: +pointTotal
    })
    .map((response: Response) => response.json());
  }
}
