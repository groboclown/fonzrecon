
import { strToDate } from './lib/index';

export class Prize {
  id: string;
  name: string;
  description: string;
  referenceUrl: string;
  imageUri: string;
  purchasePoints: number;
  expires: Date;

  static parseFromJson(data: any): Prize {
    return {
      id: data.id || null,
      name: data.name || null,
      description: data.description || null,
      referenceUrl: data.referenceUrl || null,
      imageUri: data.imageUri || null,
      purchasePoints: +data.purchasePoints || 1000000,
      expires: strToDate(data.expires)
    };
  }
}
