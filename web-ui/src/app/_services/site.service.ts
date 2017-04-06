import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import { ApiService } from './api.service';
import { Site } from '../_models/index';
import { createObservableFor } from './lib/index';

const DEFAULT_SITE_NAME = 'Your Personal Fonz';

/**
 * Fetches the site information.
 */
@Injectable()
export class SiteService {
  private refreshed = false;
  private site: Site;
  private subject: BehaviorSubject<Site>;

  constructor(
        private api: ApiService
      ) {
    this.site = createDefaultSite();
    this.subject = new BehaviorSubject<Site>(this.site);
  }

  getSync(): Site {
    return this.site;
  }

  getAsync(): Observable<Site> {
    if (!this.refreshed) {
      this.refreshSettings();
    }
    return this.subject.asObservable();
  }

  refreshSettings() {
    this.refreshed = true;
    this.site = createDefaultSite();
    this.api.get('/auth/site-settings')
      .subscribe(
        (response: Response) => {
          const newSite = createDefaultSite();
          if (response.status < 400) {
            const body = (response.json() || {})['settings'] || {};
            newSite.name = body.SiteName || DEFAULT_SITE_NAME;
            newSite.bannerImageUrl = this.toImageUrl(body.SiteBannerImage);
            newSite.smallImageUrl = this.toImageUrl(body.SiteSmallImage);
            newSite.iconImageUrl = this.toImageUrl(body.SiteIconImage);
          }
          this.site = newSite;
          this.subject.next(newSite);
        },

        (err: any) => {
          this.site = createDefaultSite();
          // Do not send an alert.
          this.subject.next(this.site);
        }
      );
  }

  toImageUrl(img: string) {
    if (!img) {
      return null;
    }
    return this.api.toUrl(img);
  }
}



function createDefaultSite(): Site {
  const ret = new Site();
  ret.name = DEFAULT_SITE_NAME;
  return ret;
}
