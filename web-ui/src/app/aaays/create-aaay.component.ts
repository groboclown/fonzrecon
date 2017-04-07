import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { User } from '../_models/index';
import { Aaay } from './aaay.model';
import { AlertStatus } from '../widgets/index';
import { CreateAaayService } from './create-aaay.service';
import { UserListService } from '../_services/user-list.service';
import { PagedData } from '../paging/index';

@Component({
    moduleId: module.id,
    selector: 'app-create-aaay',
    templateUrl: 'create-aaay.component.html'
})
export class CreateAaayComponent {
  @Input() onChangeEvent: Subject<any>;
  alertStatus = new AlertStatus();
  model: any = {};
  loading = false;

  userNames: Observable<Array<User>>;

  constructor(
      private userListService: UserListService,
      private createAaayService: CreateAaayService
  ) {}



  submitAaay(event: Event, fieldValues, valid: boolean) {
    event.preventDefault();
    if (valid) {
      this.loading = true;
      const points = (this.model.points || 0);
      const ts = (this.model.tags || '').split(/\s*;\s*/);
      console.log(`DEBUG using users ${JSON.stringify(this.model.toUsers)}`);
      const us = this.model.toUsers.map((a: {display: string, value: string}) => a.value);
      const pub = (this.model.public === false) ? false : true;
      this.createAaayService.submit({
        points: points,
        to: us,
        public: pub,
        comment: this.model.comment,
        tags: ts
      })
      .subscribe(
        (aaay: Aaay) => {
          this.alertStatus.success(`You just gave an Aaay!`);
          if (this.onChangeEvent) {
            this.onChangeEvent.next({ aaay: aaay });
          }
          this.loading = false;
        },
        (error: any) => {
          this.loading = false;
          this.alertStatus.error(error);
        }
      );
    }
  }

  /** Must be a function-as-field */
  public requestUserNames = (text: string): Observable<string[]> => {
    return this.userListService.getUserNamesMatching(text);
  }
}
