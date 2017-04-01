import {
  Component,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { SetGivingPointsService } from './set-giving-points.service';
import { AlertStatus } from '../widgets/index';


@Component({
    moduleId: module.id,
    templateUrl: 'set-giving-points.component.html',
    styleUrls: ['./set-giving-points.component.css']
})
export class SetGivingPointsComponent {
  private alertStatus = new AlertStatus();
  model: any = {};
  loading = false;

  constructor(
      private setGivingPointsService: SetGivingPointsService
  ) {}

  submit() {
    this.loading = true;
    const points = (this.model.points) || 0;
    this.setGivingPointsService.setGivingPoints(points)
    .subscribe(
      (message: any) => {
        this.loading = false;
        this.alertStatus.success(`${message.updateCount} users updated`);
      },
      (error: any) => {
        this.loading = false;
        this.alertStatus.error(error);
      }
    );
  }
}
