import { Component, OnInit } from '@angular/core';

// For global guards.
import { Router, ActivatedRoute, RoutesRecognized, CanActivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';

import { AuthGuard } from './_guards/index';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private authGuard: AuthGuard
  ) { }

  ngOnInit() {
    this.router.events
    .filter(event => event instanceof RoutesRecognized)
    .subscribe((event: RoutesRecognized) => {
      console.log(`DEBUG route ${event.url}; ${event.urlAfterRedirects}`);
      // Simple outline of how things work...

      // Allows any direct access, because this area allows for unauthenticated
      // requests.
      if (this.isSubPage(event, '/webui/login')) {
        return;
      }

      // If a validation request is made,

      // All other requests MUST be done through an authenticated connection.
      if (!this.callCanActivate(event, this.authGuard)) {
        return;
      }


    });
  }

  callCanActivate(event: RoutesRecognized, guard: CanActivate) {
    // return guard.canActivate(this.route.snapshot, this.router.routerState.snapshot);
    return guard.canActivate(this.route.snapshot, event.state);
  }

  isSubPage(event: RoutesRecognized, parent: string) {
    const url = event.urlAfterRedirects;
    return (url === parent
        || url.startsWith(parent + '/')
        || url.startsWith(parent + '?'));
  }

  extractQueryParams(event: RoutesRecognized) {
    const ret = {};
    const url = event.urlAfterRedirects;
    const qpos = url.indexOf('?');
    if (qpos >= 0) {
      const q = url.substring(qpos + 1);
      const ps = q.split('&');
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const epos = p.indexOf('=');
        if (epos < 0) {
          ret[p] = true;
        } else {
          const k = decodeURIComponent(p.substring(0, epos));
          const v = decodeURIComponent(p.substring(epos + 1));
          ret[k] = v;
        }
      }
    }
    return ret;
  }
}
