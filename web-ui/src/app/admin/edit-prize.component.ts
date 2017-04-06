import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  NgForm, FormGroup, FormControl, FormBuilder, Validators,
  CheckboxRequiredValidator, PatternValidator
} from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

import { Prize } from '../_models/prize';
import { FormFeedbackStatus } from '../widgets/index';
import { PrizeService } from './prize.service';
import { SiteService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'edit-prize.component.html',
    styleUrls: ['../_style/forms.css']
})
export class EditPrizeComponent implements OnInit {
  @ViewChild('prizeForm') prizeForm: NgForm;
  formFeedbackStatus = new FormFeedbackStatus<Prize>();
  id: string;
  uploadFile: File;
  prize: any = {};
  imageUrl: string = null;
  loading = false;

  constructor(
      private route: ActivatedRoute,
      private prizeService: PrizeService,
      private formBuilder: FormBuilder,
      private siteService: SiteService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.route.params
    .switchMap((params: Params) => {
      this.id = params['id'];
      return this.prizeService.getPrize(this.id);
    })
    // TODO remove this duplication
    .subscribe(
      (prize: Prize) => {
        this.loading = false;
        this.formFeedbackStatus.clear();
        this.updatePrize(prize);
      },
      (err: any) => {
        this.loading = false;
        this.formFeedbackStatus.error(err);
      }
    );
  }

  updatePrize(prize: Prize) {
    console.log(`DEBUG updating image url ${prize.imageUri}`);
    this.imageUrl = this.siteService.toImageUrl(prize.imageUri);
    this.prizeForm.form.patchValue({
      name: prize.name,
      description: prize.description,
      referenceUrl: prize.referenceUrl,
      imageUri: prize.imageUri,
      purchasePoints: prize.purchasePoints,
      expires: prize.expires
    });
  }


  fileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.uploadFile = fileList[0];
    }
  }


  uploadImageFile() {
    if (this.uploadFile) {
      this.loading = true;
      this.prizeService.sendImageFile(this.id, this.uploadFile)
      .subscribe(
        (imageUri: string) => {
          this.loading = false;
          this.formFeedbackStatus.success(null);
          this.prize.imageUri = imageUri;
          this.imageUrl = this.siteService.toImageUrl(imageUri);
          this.prize.imageUri = imageUri;
        },
        (err: any) => {
          this.loading = false;
          this.formFeedbackStatus.error(err);
        }
      );
    }
  }


  expirePrize() {
    // FIXME send expire
  }


  submitEditPrize(event: Event, fieldValues, valid: boolean) {
    event.preventDefault();
    if (valid) {
      this.loading = true;
      console.log(`DEBUG about to submit ${JSON.stringify(fieldValues)}`);
      this.prizeService.updatePrize({
        id: this.id,
        name: fieldValues.name,
        description: fieldValues.description,
        referenceUrl: fieldValues.referenceUrl,
        imageUri: this.prize.imageUri,
        purchasePoints: +fieldValues.purchasePoints,
        expires: this.prize.expires
      })
      .subscribe(
        (p: any) => {
          this.loading = false;
        },
        (err: any) => {
          this.loading = false;
          this.formFeedbackStatus.error(err);
        }
      );
    }
  }
}
