import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';

import { CommonService } from '../../../services/common.service';
import { NotifyService } from '../../../services/notification.service';
import { ChangePasswordService } from './changepassword.service';
import { ChangePasswordModel } from '../../../model/ChangePasswordModel';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css'],
  providers: [ChangePasswordService]
})
export class ChangepasswordComponent implements OnDestroy, CloseGuard, ModalComponent<BSModalContext> {
  context: BSModalContext;
  private changePasswordModel: ChangePasswordModel = new ChangePasswordModel();
  loading: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(public dialog: DialogRef<BSModalContext>, private _service: ChangePasswordService,
    private commonService: CommonService, private _notify: NotifyService) {
    dialog.context.dialogClass = "modal-dialog modal-sm";
    this.context = dialog.context;
  }

  beforeDismiss(): boolean {
    return false;
  }

  beforeClose(): boolean {
    return false;
  }

  changeClick() {
    this.loading = true;
    let authUser = this.commonService.AuthUser.getValue()
    this.changePasswordModel.Id = authUser.PeopleId;
    this.subscriptions.push(this._service.changePassword(this.changePasswordModel).subscribe(res => {
      if (res.StatusCode == 200) {
        this.loading = false;
        this._notify.success('Password changed successfully');
        setTimeout(this.closeClick, 1500);
      }
    }, err => {
      this.loading = false;
    }))
  }

  closeClick = () => {
    this.dialog.close(true);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
