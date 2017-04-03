import {
  Component, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';

import { SiteKeyValue } from './site-settings.model';
import { SiteSettingsService } from './site-settings.service';
import { SiteSettingKeyFormService } from './site-setting-key-form.service';
import { SiteSettingsForm } from './site-setting-key-form.model';
import { AlertStatus } from '../widgets/index';


@Component({
    moduleId: module.id,
    templateUrl: 'site-settings.component.html',
    styleUrls: ['./site-settings.component.css']
})
export class SiteSettingsComponent implements OnInit {
  private alertStatus = new AlertStatus();
  formGroupData: SiteSettingsForm;
  loading = false;
  saved = false;
  form: FormGroup;

  constructor(
      private siteSettingsKeyFormService: SiteSettingKeyFormService,
      private siteSettingsService: SiteSettingsService
  ) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.siteSettingsService.getSettings()
    .subscribe(
      (data: SiteKeyValue[]) => {
        this.loading = false;
        this.formGroupData = this.siteSettingsKeyFormService.toFormGroup(data);
        this.form = this.formGroupData.createFormGroup();
      },
      (err: any) => {
        this.loading = false;
        this.formGroupData = null;
        this.form = null;
        this.alertStatus.error(err);
      }
    );
  }

  onSubmit() {
    this.loading = true;
    this.saved = false;
    const data = this.formGroupData.getResults();

    this.siteSettingsService.setSettings(data)
    .subscribe(
      (message: any) => {
        this.loading = false;
        this.saved = true;
        this.alertStatus.success(`Updated settings`);
      },
      (error: any) => {
        this.loading = false;
        this.saved = false;
        this.alertStatus.error(error);
      }
    );
  }
}
