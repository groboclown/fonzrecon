import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { SiteKeyValue } from './site-settings.model';
import {
  BaseSiteFormData, ArraySiteFormData, SmtpSiteFormData,
  SiteSettingsForm
} from './site-setting-key-form.model';


const EMAIL_CONNECTION_KEY = 'EmailProviderConnection';
const EMAIL_PROVIDER_KEY = 'EmailProvider';
const SPECIAL_KEYS = [EMAIL_PROVIDER_KEY, EMAIL_CONNECTION_KEY];

const CONTROLTYPE_TYPE_MAP = {
  'string': 'string',
  'url': 'url',
  'uri': 'url',
  'email': 'email'
};


@Injectable()
export class SiteSettingKeyFormService {
  constructor() { }

  toFormGroup(settings: SiteKeyValue[] ): SiteSettingsForm {
    const group = new SiteSettingsForm();

    // Need to keep track of special items.
    const miscKeys: any = {};
    let pos = 0;
    for (let i = 0; i < settings.length; i++) {
      const s: SiteKeyValue = settings[i];
      const stype: string = s.valueType;
      let c: BaseSiteFormData;
      if (SPECIAL_KEYS.includes(s.key)) {
        c = null;
        miscKeys[s.key] = s;
      } else if (stype.endsWith('[]') && CONTROLTYPE_TYPE_MAP[stype.substring(0, stype.length - 2)]) {
        c = new ArraySiteFormData(s, {
          required: true,
          controlType: CONTROLTYPE_TYPE_MAP[stype.substring(0, stype.length - 2)],
          order: pos++
        });
      } else if (stype.endsWith('?') && CONTROLTYPE_TYPE_MAP[stype.substring(0, stype.length - 1)]) {
        // not requried
        c = new BaseSiteFormData(s, {
          required: false,
          controlType: CONTROLTYPE_TYPE_MAP[s.key.substring(0, s.key.length - 1)],
          order: pos++
        });
      } else if (CONTROLTYPE_TYPE_MAP[stype]) {
        c = new BaseSiteFormData(s, {
          required: true,
          controlType: CONTROLTYPE_TYPE_MAP[stype],
          order: pos++
        });
      } else {
        // Unknown type or special type
        console.log(`DEBUG unknown control type ${stype}`);
        c = null;
        miscKeys[s.key] = s;
      }
      if (c) {
        group.add(s, c);
      }
    }

    // Create special types
    if (miscKeys[EMAIL_CONNECTION_KEY] && miscKeys[EMAIL_PROVIDER_KEY]) {
      const ck: SiteKeyValue = miscKeys[EMAIL_CONNECTION_KEY];
      const pk: SiteKeyValue = miscKeys[EMAIL_PROVIDER_KEY];
      group.add(pk, new SmtpSiteFormData(pk, ck));
    }

    return group;
  }
}
