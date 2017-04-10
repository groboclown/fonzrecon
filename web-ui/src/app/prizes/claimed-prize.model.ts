
import { User, Prize } from '../_models/index';
import { strToDate,  } from '../_models/lib/index';

export class ClaimedPrize {
  id: string;
  claimedByUser: User;
  prize: Prize;
  createdAt: Date;
  pendingValidation: boolean;
  validatedByUser: User;
  validatedTime: Date;
  claimAllowed: boolean;
  claimRefusalReason: string;

  static parseFromJson(data: any): ClaimedPrize {
    const ret = new ClaimedPrize();
    ret.id = data.id;
    ret.claimedByUser = User.parseFromJson(data.claimedByUser);
    ret.prize = Prize.parseFromJson(data.prize);
    ret.createdAt = strToDate(data.createdAt);
    ret.pendingValidation = data.pendingValidation === true ? true : false;
    ret.validatedByUser = data.validatedByUser
      ? User.parseFromJson(data.validatedByUser)
      : null;
    ret.validatedTime = strToDate(data.validatedTime);
    ret.claimAllowed =
      data.claimAllowed === true
        ? true
        : (data.claimAllowed === false ? false : null);
    ret.claimRefusalReason = data.claimRefusalReason;
    return ret;
  }
}
