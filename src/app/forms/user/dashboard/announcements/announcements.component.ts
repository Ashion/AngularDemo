import { Component, OnInit } from '@angular/core';
import { Subscription } from "rxjs/Subscription";
import { DashboardService } from "app/forms/user/dashboard/dashboard.service";
import { CommonService } from "app/services/common.service";
import { DisplayAnnouncementModel } from "app/model/DashboardModel";

@Component({
  selector: 'user-announcements',
  templateUrl: './announcements.component.html'
})

export class AnnouncementsComponent implements OnInit {
  authUserObj: any;
  private announcements: DisplayAnnouncementModel[] = [];
  private subscriptions: Subscription[] = [];
  private loadingAnnouncement: boolean = true;
  private currentAnnouncement: DisplayAnnouncementModel;
  private openAnnouncementAlert: boolean = false;

  constructor(private _service: DashboardService, private commonService: CommonService) {
    this.authUserObj = this.commonService.AuthUser.getValue();
  }

  ngOnInit() {
    this.subscriptions.push(this._service.getAnnouncements(this.authUserObj.PeopleId).subscribe(res => {
      this.loadingAnnouncement = false;
      this.announcements = res.Result;
    }));
    this._service.newAnnouncement.subscribe((newAnnouncement) => {
      if (newAnnouncement)
        this.announcements.push(newAnnouncement);
    });
  }

  openAnnouncement(announcementId: string) {
    this.currentAnnouncement = this.announcements.find((annouce) => {
      return annouce.AnnouncementId == announcementId;
    });
    this.openAnnouncementAlert = true;
  }

}
