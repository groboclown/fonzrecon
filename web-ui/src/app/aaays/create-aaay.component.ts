import { Component, Input, OnInit } from '@angular/core';

import { Aaay } from './aaay.model';
import { CreateAaayService } from './create-aaay.service';

@Component({
    moduleId: module.id,
    selector: 'app-create-aaay',
    templateUrl: 'create-aaay.component.html'
})
export class CreateAaayComponent {
  model: any = {};
  loading = false;
  error = '';

  constructor(
    private createAaayService: CreateAaayService
  ) {}

  submit() {
    this.loading = true;
    const points = (this.model.points || 0);
    const ts = (this.model.tags || '').split(/\s*;\s*/);
    const us = (this.model.toUsers || '').split(/\s*;\s*/);
    const pub = (this.model.public === false) ? false : true;
    console.log(`DEBUG sending users '${this.model.toUsers}' => ${JSON.stringify(us)}`);
    this.createAaayService.submit({
      points: points,
      to: us,
      public: pub,
      comment: this.model.comment,
      tags: ts
    })
    .subscribe(
      (aaay: Aaay) => {
        // FIXME
      },
      (error: any) => {
        this.error = error.message;
      },
      () => {
        this.loading = false;
      }
    );
  }
}
