import {
  Component, OnInit, AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { ManageUserList } from './manage-user-list.model';
import { ManageUserListService } from './manage-user-list.service';
import { AlertStatus } from '../widgets/index';


@Component({
    moduleId: module.id,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-manage-user-list',
    templateUrl: 'manage-user-list.component.html',
    styleUrls: ['./manage-user-list.component.css']
})
export class ManageUserListComponent implements AfterViewInit {
  filter: any = {};
  userList: ManageUserList = new ManageUserList();
  private alertStatus = new AlertStatus();

  constructor(
      private userListService: ManageUserListService,
      private changeDetection: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.userListService.onRefresh().subscribe((list) => {
      this.userList = list;
      this.changeDetection.markForCheck();
    });
  }

  editUser(event, index, user) {
    // TODO add
  }

  deleteUser(event, index, user) {
    this.userListService.deleteUser(user.username)
    .subscribe(
      (message: any) => {
        this.alertStatus.success(message.message);
      },
      (error: any) => {
        this.alertStatus.error(error);
      }
    );
  }

  reactivateUser(event, index, user) {
    // TODO add
  }
}
