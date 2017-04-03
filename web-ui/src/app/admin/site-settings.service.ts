import {
  Component, OnInit, Injectable
} from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ApiService } from '../_services/index';
import { SiteKeyValue } from './site-settings.model';

@Injectable()
export class SiteSettingsService {

  constructor(
    private api: ApiService
  ) {}

  getSettings(): Observable<SiteKeyValue[]> {
    return this.api.get('/api/v1/settings')
    .map((response: Response) => {
      const data = response.json();
      const ret: SiteKeyValue[] = [];
      for (const k in data) {
        if (data.hasOwnProperty(k)) {
          const v = data[k];
          if (v.key && v.description && v.value) {
            ret.push(SiteKeyValue.parseFromJson(v));
          }
        }
      }
      return ret;
    });
  }

  setSettings(settings: any): Observable<any> {
    return this.api.put('/api/v1/settings', {
      settings: settings
    })
    .map((response: Response) => response.json());
  }
}
