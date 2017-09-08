import { Component, OnInit, OnDestroy } from '@angular/core';

import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DashboardService } from "app/forms/user/dashboard/dashboard.service";
import { CommonService } from "app/services/common.service";
import { AnnouncementModel } from "app/model/DashboardModel";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'app-announcement-popup',
  templateUrl: './announcement-popup.component.html'
})
export class AnnouncementPopupComponent implements OnDestroy, CloseGuard, ModalComponent<BSModalContext> {
  authUserObj: any;
  context: BSModalContext;
  loading: boolean = false;
  ckeditorContent: string;
  private subscriptions: Subscription[] = [];
  date: Date = new Date();

  constructor(public dialog: DialogRef<BSModalContext>, private _service: DashboardService,
    private commonService: CommonService) {
    dialog.context.dialogClass = "modal-dialog modal-lg";
    this.context = dialog.context;
    this.authUserObj = this.commonService.AuthUser.getValue();
  }

  ngOnInit() { }

  beforeDismiss?(): boolean | Promise<boolean> {
    return false;
  }

  beforeClose?(): boolean | Promise<boolean> {
    return false;
  }

  saveAnnouncement() {
    let announcementObj: AnnouncementModel = {
      ClientId: this.authUserObj.ClientId,
      Message: this.ckeditorContent,
      SenderId: this.authUserObj.PeopleId,
      ExpiryDate: this.date,
      IsAdmin: false
    }
    this.subscriptions.push(this._service.saveAnnouncement(announcementObj).subscribe(res => {
      this.dialog.close(true);
    }));
  }

  cancelClick() {
    this.dialog.close(true);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
