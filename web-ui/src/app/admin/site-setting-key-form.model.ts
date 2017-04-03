

import { SiteKeyValue } from './site-settings.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';


export class SiteSettingsForm {
  keyValueMap: any = {};
  formControlMap: any = {};
  formDataList: BaseSiteFormData[] = [];

  add(data: SiteKeyValue, formData: BaseSiteFormData) {
    this.keyValueMap[data.key] = data;
    formData.addFormControl(this.formControlMap);
    this.formDataList.push(formData);
  }

  createFormGroup(): FormGroup {
    return new FormGroup(this.formControlMap);
  }

  getResults(): any {
    const ret: any = {};
    for (let i = 0; i < this.formDataList.length; i++) {
      this.formDataList[i].extractFormData(ret, this.formControlMap);
    }
    return ret;
  }
}


export class BaseSiteFormData {
  data: SiteKeyValue;
  controlType: string;
  order: number;
  required: boolean;
  key: string;

  constructor(
    data: SiteKeyValue,
    options: { required?: boolean, order?: number, controlType?: string }
  ) {
    this.data = data;
    this.controlType = options.controlType || '(unset)';
    this.order = options.order === undefined ? 1 : options.order;
    this.required = !!options.required;
    this.key = data.key;
  }

  addFormControl(groups: any) {
    if (this.required) {
      groups[this.key] = new FormControl(this.data.value || '', Validators.required);
    } else {
      groups[this.key] = new FormControl(this.data.value);
    }
  }

  extractFormData(results: any, groups: any) {
    if (!groups[this.key].pristine) {
      results[this.data.key] = groups[this.key].value;
    }
  }
}


export class ArraySiteFormData extends BaseSiteFormData {
  // TODO correctly implement
  addFormControl(groups: any) {
    const val = this.data.value ? this.data.value.join('; ') : '';
    groups[this.key] = new FormControl(val);
  }

  extractFormData(results: any, groups: any) {
    if (!groups[this.key].pristine) {
      results[this.data.key] = groups[this.key].value.split(';')
        .map((v: string) => v.trim());
    }
  }
}


export class SmtpKey {
  subkey: string;
  topkey: string;
}

export class SmtpSiteFormData extends BaseSiteFormData {
  emailConnection: SiteKeyValue;
  keys: SmtpKey[] = [];


  constructor(emailProvider: SiteKeyValue, emailConnection: SiteKeyValue, options: any = {}) {
    super(emailProvider, options);
    this.controlType = 'smtp';
    this.emailConnection = emailConnection;
    const dictValues = emailConnection.value;
    for (const k in dictValues) {
      if (dictValues.hasOwnProperty(k)) {
        this.keys.push({ subkey: k, topkey: this.key + '.' + k });
      }
    }
  }

  addFormControl(groups: any) {
    groups[this.key] = new FormControl(this.data.value || 'smtp', Validators.required);
    const v = this.emailConnection.value;
    for (let i = 0; i < this.keys.length; i++) {
      groups[this.keys[i].topkey] = new FormControl(v[this.keys[i].topkey] || '', Validators.required);
    }
  }

  extractFormData(results: any, groups: any) {
    let pristine = groups[this.key].pristine;
    for (let i = 0; i < this.keys.length; i++) {
      pristine = pristine && groups[this.keys[i].topkey].pristine;
    }

    if (!pristine) {
      results[this.data.key] = groups[this.key].value;
      const v = this.emailConnection.value;
      const rv = {};
      for (let i = 0; i < this.keys.length; i++) {
        rv[this.keys[i].subkey] = groups[this.keys[i].topkey].value;
      }
      results[this.emailConnection.key] = rv;
    }
  }
}
