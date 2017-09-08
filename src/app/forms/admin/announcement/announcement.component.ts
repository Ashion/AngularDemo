import { Component, OnInit } from '@angular/core';
import { DashboardService } from "app/forms/user/dashboard/dashboard.service";
import { CommonService } from "app/services/common.service";
import { AnnouncementModel } from "app/model/DashboardModel";
import { Subscription } from "rxjs/Subscription";
import { ScriptService } from "app/services/scripts.service";

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html'
})
export class AnnouncementComponent implements OnInit {
  authUserObj: any;
  loading: boolean = false;
  scriptLoaded: boolean = false;
  ckeditorContent: string;
  date: Date = new Date();
  private subscriptions: Subscription[] = [];

  constructor(private _service: DashboardService, private commonService: CommonService,
    private _scriptService: ScriptService) {
    this.authUserObj = this.commonService.AuthUser.getValue();
    this._scriptService.load('editor').then(res => {
      this.scriptLoaded = true;
    });
  }

  ngOnInit() {
  }

  saveAnnouncement() {
    this.loading = true;
    let announcementObj: AnnouncementModel = {
      ClientId: this.authUserObj.ClientId,
      Message: this.ckeditorContent,
      SenderId: this.authUserObj.PeopleId,
      ExpiryDate: this.date,
      IsAdmin: true
    }
    this.subscriptions.push(this._service.saveAnnouncement(announcementObj).subscribe(res => {
      this.loading = false;
      this.ckeditorContent = '';
      this.date = new Date();
    }, err => {
      this.loading = false;
    }));
  }

}
