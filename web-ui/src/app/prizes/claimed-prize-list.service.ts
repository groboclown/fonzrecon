import { Injectable, Inject, OnInit } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';

import { ApiService, MeService } from '../_services/index';
import { PagedData, PagingService } from '../paging/index';

import { LoginAccount } from '../_models/index';
import { ClaimedPrize } from './claimed-prize.model';

 @Injectable()
export class ClaimedPrizeListService extends PagingService<ClaimedPrize>
    implements OnInit {
  private _loginAccount = new LoginAccount();
  get loginAccount(): LoginAccount {
    return this._loginAccount;
  }

  constructor(
      private _api: ApiService,
      private _me: MeService
  ) {
    super(_api);
    this.uri = '/api/v1/claimed-prizes';
  }

  isOwnedByMe(claimed: ClaimedPrize) {
    if (this._loginAccount && claimed) {
      return claimed.claimedByUser.username === this._loginAccount.username;
    }
    return false;
  }

  canValidateClaims(): boolean {
    return this._me.canValidateClaims();
  }

  loadClaimedPrizeDetails(claimed: ClaimedPrize): Observable<ClaimedPrize> {
    if (!claimed || claimed.pendingValidation || !this.isOwnedByMe(claimed)) {
      // No additional information to find
      return Observable.create(claimed);
    }
    return this._api.get('/api/v1/claimed-prizes/' + claimed.id)
    .map((response: Response) => {
      return ClaimedPrize.parseFromJson(response.json());
    });
  }

  allowClaim(claimed: ClaimedPrize): Observable<ClaimedPrize> {
    if (!claimed || !claimed.pendingValidation || !this.canValidateClaims()) {
      // Cannot be validated.
      return Observable.create(claimed);
    }
    return this._api.put('/api/v1/claimed-prizes/' + claimed.id + '/validate', {
      refused: false
    })
    .map((response: Response) => {
      return this.updateClaim(response);
    });
  }

  refuseClaim(claimed: ClaimedPrize, reason: string): Observable<ClaimedPrize> {
    if (!claimed || !claimed.pendingValidation || !this.canValidateClaims() || !reason) {
      // Cannot be validated.
      return Observable.create(claimed);
    }
    return this._api.put('/api/v1/claimed-prizes/' + claimed.id + '/validate', {
      refused: true,
      refusalMessage: reason
    })
    .map((response: Response) => {
      return this.updateClaim(response);
    });
  }

  private updateClaim(response: Response): ClaimedPrize {
    const claimed = ClaimedPrize.parseFromJson(response.json());
    if (this.updateInstance(claimed, 'id')) {
      return claimed;
    }
    return null;
  }

  /** Override: load up the extra parameters for the filter.
   */
  _filterParameters(queryParams: any, params: any) {
    if (queryParams.claimedByUser) {
      params.user = queryParams.claimedByUser;
    }
  }

  _parseItemFromJson(item: any): ClaimedPrize {
    return ClaimedPrize.parseFromJson(item);
  }

  ngOnInit() {
    this._me.getLoginAccount()
    .subscribe((login: LoginAccount) => {
      this._loginAccount = login;
    });
  }
}
