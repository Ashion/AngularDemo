import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from "rxjs";

import { ClientGroup } from "app/model/ClientGroupModel";
import { valDuplicateInputStyle, errors, storageKeys } from "app/shared/globals";
import { GroupEditorService } from "app/forms/user/group-editor/group-editor.service";
import { DropDownModel } from "app/model/DropDownModel";
import { BindingService } from "app/services/binding.service";
import * as moment from 'moment';
import { CommonService } from "app/services/common.service";

@Component({
  selector: 'group-setting',
  templateUrl: './group-setting.component.html',
  styleUrls: ['./group-setting.component.css']
})
export class GroupSettingComponent implements OnInit, OnDestroy {

  subscription: Subscription[] = [];
  _moment = moment;
  IsSelected: boolean = true;
  model: ClientGroup = new ClientGroup();
  territoryData: DropDownModel[] = [];
  timezoneData: DropDownModel[] = [];
  countryData: DropDownModel[] = [];
  measurementUnitData: DropDownModel[] = [];
  loading: boolean = false;

  _valDuplicateInputStyle = valDuplicateInputStyle;
  _err = errors;
  isDuplicateName: boolean = null;

  constructor(private _groupService: GroupEditorService, private _bindingService: BindingService,
    private _commonService: CommonService) {
    if (localStorage.getItem(storageKeys.groupEditorId) && localStorage.getItem(storageKeys.groupEditorId) != 'new') {
      this.model.ClientGroupId = localStorage.getItem(storageKeys.groupEditorId);
    }
    else {
      this.model.ClientId = this._commonService.AuthUser.getValue().ClientId;
    }
  }

  ngOnInit() {
    this.subscription.push(this._bindingService.getGroupBindings().subscribe(res => {
      this.territoryData = res.Result["Territory"];
      this.timezoneData = res.Result["Timezone"];
      this.countryData = res.Result["Country"];
      this.measurementUnitData = res.Result["MeasurementUnit"];
      if (this.model.ClientGroupId) {
        this.subscription.push(this._groupService.getGroupById(this.model.ClientGroupId).subscribe(res => {
          debugger;
          let result: ClientGroup = res.Result;
          this.model = result;
          if (this.model.SunriseTime) this.model.SunriseTime = this._moment.utc(this.model.SunriseTime, 'HH:mm').format('HH:mm');
          if (this.model.SunsetTime) this.model.SunsetTime = this._moment.utc(this.model.SunsetTime, 'HH:mm').format('HH:mm');
          if (this.model.OperationEndTime) this.model.OperationEndTime = this._moment.utc(this.model.OperationEndTime, 'HH:mm').format('HH:mm');
          if (this.model.OperationStartTime) this.model.OperationStartTime = this._moment.utc(this.model.OperationStartTime, 'HH:mm').format('HH:mm');
        }));
      }
    }));
  }

  verifyGroupName(event: any) {
    if (event.target.value != "") {
      this._groupService.verifyGroupName(event.target.value, this.model.ClientGroupId).subscribe(res => {
        this.isDuplicateName = res.Result;
      });
    }
    else
      this.isDuplicateName = null;
  }

  saveGroup() {
    debugger;
    this.loading = true;
    if (this.model.SunriseTime) this.model.SunriseTime = this._moment(this.model.SunriseTime, 'HH:mm').format('HH:mm');
    if (this.model.SunsetTime) this.model.SunsetTime = this._moment(this.model.SunsetTime, 'HH:mm').format('HH:mm');
    if (this.model.OperationEndTime) this.model.OperationEndTime = this._moment(this.model.OperationEndTime, 'HH:mm').format('HH:mm');
    if (this.model.OperationStartTime) this.model.OperationStartTime = this._moment(this.model.OperationStartTime, 'HH:mm').format('HH:mm');

    this._groupService.saveClientGroup(this.model).subscribe(res => {
      this.loading = false;
      localStorage.setItem(storageKeys.groupEditorId, res.Result);
    }, err => {
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    // localStorage.removeItem(storageKeys.groupEditorId);
    this.subscription.forEach(element => {
      element.unsubscribe();
    });
  }
}
