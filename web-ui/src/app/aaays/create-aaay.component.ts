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

// TODO use type-ahead for user search.
// See example:
// https://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html

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
  userLookaheadForm = new FormControl();

  constructor(
      private userListService: UserListService,
      private createAaayService: CreateAaayService
  ) {
    this.userNames = this.userLookaheadForm
    .valueChanges
    .debounceTime(400)
    .distinctUntilChanged()
    .switchMap((nameLike) => {
      console.log(`DEBUG sending request to first page`);
      this.userListService.loadFirstPage({ nameLike: nameLike });
      return this.userListService.onRefresh();
    })
    .map((paged: PagedData<User>) => paged.results);
  }

  submit() {
    this.loading = true;
    const points = (this.model.points || 0);
    const ts = (this.model.tags || '').split(/\s*;\s*/);
    const us = (this.model.toUsers || '').split(/\s*;\s*/);
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
