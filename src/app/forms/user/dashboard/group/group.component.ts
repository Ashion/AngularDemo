import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { Subscription } from 'rxjs/Subscription';

import { startsWith as _startsWith } from "lodash";

import { GroupEditorService } from "app/forms/user/group-editor/group-editor.service";
import { CommonService } from "app/services/common.service";

import * as moment from 'moment';
import { storageKeys } from "app/shared/globals";

@Component({
  selector: 'user-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit, OnDestroy {
  authUserObj: any;
  private subscriptions: Subscription[] = [];
  private clientGropus: any = [];
  private filterGroups: any = [];
  private groupSerach: string;
  private loadingGroups: boolean = false;
  currDate: any;
  timer: any;
  _moment = moment;

  constructor(private router: Router, private _groupService: GroupEditorService, private commonService: CommonService) {
    this.authUserObj = this.commonService.AuthUser.getValue();
    this.currDate = this._moment.utc();
  }

  ngOnInit() {
    this.loadingGroups = true;
    this.subscriptions.push(this._groupService.getGroupList(this.authUserObj.ClientId).subscribe(grps => {
      this.loadingGroups = false;
      this.clientGropus = this.filterGroups = grps.Result;
    }, err => { this.loadingGroups = false; }));
    this.timer = setInterval(() => {
      this.currDate = this._moment.utc();
    }, 1000);
  }

  searchGroup() {
    this.filterGroups = this.clientGropus.filter(grp => _startsWith(grp.Name.toLowerCase(), this.groupSerach));
  }

  clearFilter() {
    this.filterGroups = this.clientGropus;
    this.groupSerach = '';
  }

  groupClick(groupId: string) {
    debugger;
    localStorage.setItem(storageKeys.groupEditorId, groupId);
    this.router.navigateByUrl("/user/group-editor/editor");
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
