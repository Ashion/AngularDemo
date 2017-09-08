import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { BindingService } from "app/services/binding.service";
import { startsWith as _startsWith } from "lodash";
import { CommonService } from "app/services/common.service";
import { LiveTrackingService } from "app/forms/user/live-tracking/live-tracking.service";

import * as moment from 'moment';
import { GroupEditorService } from "app/forms/user/group-editor/group-editor.service";

@Component({
  selector: 'livetracking-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {

  private subscriptions: Subscription[] = [];
  authUserObj: any;
  private loadingGroups: boolean = false;
  private clientGropus: any = [];
  private filterGroups: any = [];
  private groupSerach: string;
  private onoffswitch: boolean = true;
  private movingVehicleCount: number = 0;
  _moment = moment;

  constructor(private _bindingService: BindingService, private commonService: CommonService,
    private _liveTrackingService: LiveTrackingService, private _groupService: GroupEditorService) {
    this.authUserObj = this.commonService.AuthUser.getValue();
  }

  ngOnInit() {
    this.loadingGroups = true;
    this.subscriptions.push(this._groupService.getgroupvehiclelist().subscribe(clientGroups => {
      this.loadingGroups = false;
      this.clientGropus = this.filterGroups = clientGroups.Result;
    }, err => { this.loadingGroups = false; }));

    this._liveTrackingService.movingVehicles.subscribe((val: number) => {
      this.movingVehicleCount = val;
    });
  }

  searchGroup() {
    this.filterGroups = this.clientGropus.filter(grp => _startsWith(grp.Name.toLowerCase(), this.groupSerach));
  }

  clearFilter() {
    this.filterGroups = this.clientGropus;
    this.groupSerach = '';
  }

  followGroup(groupId: string, group: any) {
    group.isFollow = !group.isFollow;
    this._liveTrackingService.setFollowGroupId(groupId);
    let vehicleIds: Array<string> = [];
    group.VehicleList.forEach(element => {
      element.isFollow = group.isFollow;
      vehicleIds.push(element.Id);
    });
    this._liveTrackingService.setFollowVehicleId(vehicleIds);
  }

  followVehicle(vehicleId: string, group: any, vehicle: any) {
    vehicle.isFollow = !vehicle.isFollow;
    this._liveTrackingService.setFollowVehicleId([vehicleId]);
    let checkFollow = true;
    group.VehicleList.forEach(element => {
      if (!element.isFollow) checkFollow = false;
    });
    group.isFollow = checkFollow;
  }

  // get vehicle list by client groupid
  getList(clientVehicleList, clientGroupId) {
    let obj = clientVehicleList.find(x => x.ClientGroupId == clientGroupId);
    return obj.VehicleList;
  }

  // get vehicle list count by client groupid
  getListCount(clientVehicleList, clientGroupId) {
    let obj = clientVehicleList.find(x => x.ClientGroupId == clientGroupId);
    return obj.VehicleList.length;
  }

  topSwitchChangeEvent(val) {
    this.clientGropus.forEach(element => {
      element.isFollow = false;
      element.VehicleList.forEach(velement => {
        velement.isFollow = false;
      });
    });
    this._liveTrackingService.setTopSwitchChange(val);
  }
}
