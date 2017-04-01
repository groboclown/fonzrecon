

import { strToDate } from './lib';

export class User {
  username: string;
  imageUri: string;
  names: string[];
  primaryName: string;
  updatedAt: Date;
  createdAt: Date;
  pointsToAward: number;
  organization: string;
  receivedPointsToSpend: number;
  contacts: any[];
  locale: string;
  active: boolean;
  role: string;
  banned: boolean;
  banExpires: Date;
  pendingResetAuthentication: boolean;
  accountEmail: string;

  static parseFromJson(data: any): User {
    const ret: User = new User();
    ret.names = [];
    ret.contacts = [];
    ret.active = false;

    if (data.type === 'User' || data.type === 'UserBrief') {
      ret.username = data.username;
      ret.organization = data.organization;
      ret.names = data.names;
      ret.imageUri = data.imageUri;
      ret.active = data.active === false ? false : true;
    }
    if (data.type === 'User') {
      ret.createdAt = strToDate(data.createdAt);
      ret.updatedAt = strToDate(data.updatedAt);
      ret.pointsToAward = +data.pointsToAward;
      ret.receivedPointsToSpend = +data.receivedPointsToSpend;
      ret.locale = data.locale;
      ret.role = data.role || 'USER';
      ret.banned = data.banned || false;
      ret.banExpires = strToDate(data.banExpires);
      ret.pendingResetAuthentication = data.pendingResetAuthentication || false;
      ret.accountEmail = data.accountEmail;

      // TODO fill in contacts:
      /*
      [
        {
          "type": "email",
          "server": null,
          "address": "username1@fonzrecon.email.server"
        }
      ]
      */
    }
    if (data.type === 'UserBriefRef') {
      ret.username = data.username;
    }
    ret.primaryName = ret.username;
    for (let i = 0; i < ret.names.length; i++) {
      if (ret.names[i] !== ret.username) {
        ret.primaryName = ret.names[i];
        break;
      }
    }
    return ret;
  }
}
