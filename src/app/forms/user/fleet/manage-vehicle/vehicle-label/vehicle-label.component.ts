import { EventEmitter } from '@angular/core';
import { Component, OnInit, Input, OnDestroy, Output } from '@angular/core';
import { NotifyService } from "app/services/notification.service";
import { errors } from "app/shared/globals";
import { ConfirmPopup } from "app/components/wrapper/confirm-popup";
import { FleetService } from "app/forms/user/fleet/fleet.service";

import { Subject } from 'rxjs/Subject';
import "rxjs/add/operator/takeUntil";
import { ManageVehicleModel, VehicleLabelModel } from "app/model/ManageVehicle";

@Component({
  selector: 'vehicle-label',
  templateUrl: './vehicle-label.component.html'
})

export class VehicleLabelComponent implements OnInit, OnDestroy {

  @Input() vehicleId: string = "";
  @Input() labelList: Array<VehicleLabelModel> = [];

  @Output()
  onSaveLabel = new EventEmitter();

  _err = errors;
  ngUnsubscribe: Subject<void> = new Subject<void>();

  displayMode: boolean = true;
  searchText: string = "";

  labelId: string = null;
  labelName: string = "";
  labelColorId: string = "";

  colorList: Array<any> = [];
  lblList: Array<any> = [];

  constructor(
    private notifyService: NotifyService,
    private confirmPopup: ConfirmPopup,
    private fleetService: FleetService
  ) { }

  ngOnInit() {
    this.lblList = this.labelList;
    this.fleetService.getVehicleColor().takeUntil(this.ngUnsubscribe).subscribe(res => {
      this.colorList = res.Result;
    });
  }

  searchLabel(value: string) {
    this.searchText = value;
    this.lblList = this.labelList.filter(p => p.Name.toLowerCase().includes(value.toLowerCase()));
  }

  displayLabel() {
    this.displayMode = true;
    this.resetLabel();
  }

  createLabel() {
    this.displayMode = false;
    this.resetLabel();
  }

  editLabel(labelObj) {
    this.displayMode = false;
    this.labelId = labelObj.VehicleLabelId;
    this.labelColorId = labelObj.VehicleColorId;
    this.labelName = labelObj.Name;
  }

  deleteLabel(vehicleLabelId) {
    this.confirmPopup.openConfirmation("Are you sure to delete this Label?").then(res => {
      let obj = this.labelList.find(x => x.VehicleLabelId == vehicleLabelId);
      if (obj) {
        if (obj.IsAdded) {
          // remove object from label list
          var index = this.labelList.findIndex(x => x.VehicleLabelId == vehicleLabelId);
          if (index !== -1) this.labelList.splice(index, 1);
        }
        else if (obj.IsModified) {
          // set IsDeleted flag and remove IsModified key-value from lable list
          delete obj["IsModified"];
          obj.IsDeleted = true;
        }
        else
          obj.IsDeleted = true;
      }
    });
  }

  saveLabel() {

    let duplicateObj = this.labelList.find(x =>
      x.Name.toLowerCase() == this.labelName.toLowerCase() && x.VehicleColorId == this.labelColorId
      && x.VehicleLabelId != this.labelId && !x.IsDeleted);

    if (duplicateObj) {
      this.notifyService.error('Label Name with selected Color is already exist.');
      return;
    }

    if (this.labelId) {
      // edit mode
      let obj = this.labelList.find(x => x.VehicleLabelId == this.labelId);
      obj.Name = this.labelName;
      obj.VehicleColorId = this.labelColorId;
      obj.ColorCode = this.colorList.find(x => x.VehicleColorId == this.labelColorId).ColorCode;
      if (!obj.IsAdded)
        obj.IsModified = true;

      this.displayMode = true;
      this.resetLabel();
    }
    else {
      // add mode
      let obj: VehicleLabelModel = new VehicleLabelModel();
      obj.VehicleLabelId = Math.random().toString();
      obj.VehicleId = this.vehicleId;
      obj.Name = this.labelName;
      obj.VehicleColorId = this.labelColorId;
      obj.ColorCode = this.colorList.find(x => x.VehicleColorId == this.labelColorId).ColorCode;
      obj.IsAdded = true;

      this.labelList.push(obj);
      this.displayMode = true;
      this.resetLabel();
    }
    this.onSaveLabel.emit(this.labelList);

  }

  resetLabel() {
    this.searchText = "";
    this.lblList = this.labelList;

    this.labelId = null;
    this.labelColorId = this.colorList[0].VehicleColorId;
    this.labelName = "";
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
