

import { User } from '../_models/index';
import { strToDate } from '../_models/lib/index';

export class ThumbsUp {
  id: string;
  updatedAt: Date;
  createdAt: Date;
  givenBy: User;
  pointsToEachUser: number;
  comment: string;

  static parseFromJson(data: any): ThumbsUp {
    const ret = new ThumbsUp();
    if (data) {
      ret.id = data.id || null;
      ret.updatedAt = strToDate(data.updatedAt);
      ret.createdAt = strToDate(data.createdAt);
      ret.givenBy = User.parseFromJson(data.givenBy);
      ret.pointsToEachUser = data.pointsToEachUser || 0;
      ret.comment = data.comment || '';
    }
    return ret;
  }
}


export class Aaay {
  id: string;
  uri: string;
  updatedAt: Date;
  createdAt: Date;
  givenBy: User;
  awardedTo: User[];
  comment: string;
  tags: string[];
  public: boolean;
  thumbsUps: ThumbsUp[];
  pointsToEachUser: number;

  static parseFromJson(data: any): Aaay {
    const ret = new Aaay();
    if (data) {
      ret.id = data.id || null;
      ret.uri = data.uri || null;
      ret.updatedAt = strToDate(data.updatedAt);
      ret.createdAt = strToDate(data.createdAt);
      ret.givenBy = User.parseFromJson(data.givenBy);
      ret.awardedTo = [];
      if (data.awardedTo) {
        for (let i = 0; i < data.awardedTo.length; i++) {
          ret.awardedTo.push(User.parseFromJson(data.awardedTo[i]));
        }
      }
      ret.comment = data.comment || '';
      ret.tags = data.tags || [];
      ret.public = data.public || false;
      ret.thumbsUps = [];
      if (data.thumbsUps) {
        for (let i = 0; i < data.thumbsUps.length; i++) {
          ret.thumbsUps.push(ThumbsUp.parseFromJson(data.thumbsUps[i]));
        }
      }
      ret.pointsToEachUser = data.pointsToEachUser || 0;
    }
    return ret;
  }
}
