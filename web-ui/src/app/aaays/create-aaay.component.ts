import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Aaay } from './aaay.model';
import { AlertStatus } from '../widgets/index';
import { CreateAaayService } from './create-aaay.service';

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

  constructor(
    private createAaayService: CreateAaayService
  ) {}

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
        console.log(`DEBUG received aaay`);
        this.alertStatus.success(`You just gave an Aaay!`);
        if (this.onChangeEvent) {
          console.log(`DEBUG sending change event`);
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
