import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
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
  private loaded: Boolean = false;
  private site: Site;

  constructor(
        private api: ApiService
      ) {
    this.site = createDefaultSite();
  }

  getSync(): Site {
    return this.site;
  }

  getAsync(): Observable<Site> {
    if (this.loaded) {
      return createObservableFor(this.site);
    }
    return this.refreshSettings();
  }

  refreshSettings(): Observable<Site> {
    this.site = createDefaultSite();
    return this.api.get('/auth/site-settings')
      .map((response: Response) => {
        const newSite = createDefaultSite();
        if (response.status < 400) {
          const body = (response.json() || {})['settings'] || {};
          newSite.name = body.SiteName || DEFAULT_SITE_NAME;
          newSite.bannerImageUrl = this.toImageUrl(body.SiteBannerImage);
          newSite.smallImageUrl = this.toImageUrl(body.SiteSmallImage);
          newSite.iconImageUrl = this.toImageUrl(body.SiteIconImage);
        }
        this.site = newSite;
        this.loaded = true;
        return this.site;
      })
      .catch((err: any) => {
        this.site = createDefaultSite();
        // Do not send an alert.
        return createObservableFor(this.site);
      });
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
