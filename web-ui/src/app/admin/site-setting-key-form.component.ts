import {
  Component, Input
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseSiteFormData } from './site-setting-key-form.model';
import { SiteKeyValue } from './site-settings.model';

@Component({
    moduleId: module.id,
    selector: 'app-site-setting-key-form',
    templateUrl: 'site-setting-key-form.component.html',
    styleUrls: ['./site-setting-key-form.component.css']
})
export class SiteSettingKeyFormComponent {
  @Input() data: BaseSiteFormData;
  @Input() form: FormGroup;

  get isValid() {
    return this.form
      && this.form.controls
      && this.form.controls[this.data.key]
      && this.form.controls[this.data.key].valid;
  }
}
