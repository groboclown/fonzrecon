
import { FormControl, FormGroup, Validators } from '@angular/forms';

export class SiteKeyValue {
  key: string;
  description: string;
  value: any;
  valueType: string;

  static parseFromJson(data: any): SiteKeyValue {
    if (!data.key && !data.description && !data.valueType) {
      return null;
    }
    return {
      key: data.key || '',
      description: data.description || '',
      value: data.value || null,
      valueType: data.valueType
    };
  }
}
