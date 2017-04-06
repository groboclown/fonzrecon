import { Component, Input, ViewChild } from '@angular/core';
import {
  NgForm, FormGroup, FormControl, FormBuilder, Validators,
  CheckboxRequiredValidator, PatternValidator
} from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

import { Prize } from '../_models/prize';
import { FormFeedbackStatus } from '../widgets/index';
import { PrizeService } from './prize.service';

@Component({
    moduleId: module.id,
    templateUrl: 'create-prize.component.html',
    styleUrls: ['../_style/forms.css']
})
export class CreatePrizeComponent {
  @ViewChild('prizeForm') prizeForm: NgForm;
  formFeedbackStatus = new FormFeedbackStatus<Prize>();
  id: string;
  prize: any = {};
  loading = false;

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private prizeService: PrizeService,
      private formBuilder: FormBuilder
  ) {}

  submitCreatePrize(event: Event, fieldValues, valid: boolean) {
    event.preventDefault();
    if (valid) {
      this.loading = true;
      console.log(`DEBUG about to submit ${JSON.stringify(fieldValues)}`);
      this.prizeService.createPrize({
        id: null,
        name: fieldValues.name,
        description: fieldValues.description,
        referenceUrl: fieldValues.referenceUrl,
        imageUri: null,
        purchasePoints: +fieldValues.purchasePoints,
        expires: null
      })
      .subscribe(
        (p: Prize) => {
          this.loading = false;
          this.router.navigate(['/webui/admin/edit-prize/', p.id]);
        },
        (err: any) => {
          this.loading = false;
          this.formFeedbackStatus.error(err);
        }
      );
    }
  }
}
