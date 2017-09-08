import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

import { GroupVehicle, Fuel } from "app/model/ClientGroupModel";
import { BindingService } from "app/services/binding.service";
import { DropDownModel } from "app/model/DropDownModel";
import { errors, storageKeys } from "app/shared/globals";
import { GroupEditorService } from "app/forms/user/group-editor/group-editor.service";

@Component({
  selector: 'vehicle',
  templateUrl: './vehicle.component.html'
})
export class VehicleComponent implements OnInit {

  subscription: Subscription[] = [];
  IsSelected: boolean = true;
  _err = errors;
  loading: boolean = false;
  isNew: boolean = false;
  model: GroupVehicle = new GroupVehicle();
  ClassDS: Array<string> = ['1', '2', '3', '4', '5', '6', '7', '8'];
  IgnitionStatusDS: Array<{ Id: number, Name: string }> = [{ Id: 0, Name: 'Unknown' },
  { Id: 1, Name: 'Off' }, { Id: 2, Name: 'On' }];
  TransmissionDS: Array<{ Id: number, Name: string }> = [{ Id: 1, Name: 'Automatic' }, { Id: 2, Name: 'Manual' }];
  countryDS: DropDownModel[] = [];
  fuelTypeDS: DropDownModel[] = [];
  fuelSystemTypeDS: DropDownModel[] = [];
  VehicleTypeDS: DropDownModel[] = [];

  constructor(private activatedRoute: ActivatedRoute, private _bindingService: BindingService,
    private _groupService: GroupEditorService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(param => {
      if (param["id"] == 'new') {
        this.isNew = true;
      }
      else {
        this.model.VehicleId = param["id"];
      }
    });
    this.model.ClientGroupId = localStorage.getItem(storageKeys.groupEditorId);
    this.subscription.push(this._bindingService.getGroupVehicleBindings().subscribe(res => {
      this.countryDS = res.Result["Country"];
      this.VehicleTypeDS = res.Result["VehicleType"];
      this.fuelTypeDS = res.Result["FuelType"];
      this.fuelSystemTypeDS = res.Result["FuelSystemType"];
      this.model.IgnitionStatus = this.IgnitionStatusDS[0].Id;
      this.model.OtherDetails.VehicleClassId = this.ClassDS[0];
    }));
    let fuelArr: Fuel[] = []
    for (var index = 0; index < 4; index++) {
      let fuel = new Fuel();
      fuel.TankNo = index + 1;
      fuelArr.push(fuel);
    }
    this.model.Fuel = fuelArr;
  }

  saveVehicle() {
    debugger;
    this.loading = true;
    this.model.Fuel = this.model.Fuel.filter(f => {
      if (f.Circumference || f.FlowRate || f.FuelCapacity || f.FuelLevel || f.MaxFuelVoltage ||
        f.MinFuelVoltage || f.SensorHeight || f.SpringHeight || f.TankLength) {
        return true;
      }
      else
        return false;
    });
    this._groupService.saveGroupVehicle(this.model).subscribe(res => {
      this.loading = false;
    }, err => {
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.subscription.forEach(element => {
      element.unsubscribe();
    });
  }
}
