import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import { createObservableFor } from '../_services/lib';

import { ApiService } from '../_services/index';
import { Aaay } from './aaay.model';


/**
 * Generic service; must be implemented by the sub-class.
 */
 @Injectable()
export class CreateAaayService {

  constructor(
    private api: ApiService
  ) {}

  submit(data: any): Observable<Aaay> {
    return this.api.post('/api/v1/aaays', data)
    .flatMap((response: Response) => {
      // TODO parse out the returned AaayRef.
      // if (response.)
      return createObservableFor(null);
    });
  }
}
