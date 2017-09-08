import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor, CompositeFilterDescriptor, State } from '@progress/kendo-data-query';
import { FleetService } from 'app/forms/user/fleet/fleet.service';
import { DropDownViewModel } from 'app/model/ClientModel';
import { StatusDetailModel } from 'app/model/Common';
import { DropDownModel } from 'app/model/DropDownModel';
import { ManageVehicleStatusModel } from 'app/model/ManageVehicle';
import { ManageVehicleModel } from 'app/model/ManageVehicle';
import { BindingService } from 'app/services/binding.service';
import { NotifyService } from 'app/services/notification.service';
import { errors, getStatus, isUUID, manage_vehicle_tab as tabs, valDuplicateInputStyle, activityStatus } from 'app/shared/globals';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-fleet-manage-vehicle',
  templateUrl: './manage-vehicle.component.html'
})

export class ManageVehicleComponent implements OnInit {

  _tabs = tabs;
  _valDuplicateInputStyle = valDuplicateInputStyle;
  _err = errors;
  _activityStatus = activityStatus;

  vehicleId: string = "";
  tabName: string = tabs.vehicle_details;
  defaultDriverItem: DropDownViewModel = { Name: "No Default Driver", Id: null };

  model: ManageVehicleModel = new ManageVehicleModel();
  driverList: Array<DropDownModel> = [];
  deviceList: Array<DropDownModel> = [];
  realOdometer: number = null;
  currentOdometer: number = null;
  vehicleStatus: ManageVehicleStatusModel = null;

  isDuplicateName: any = null;

  loadingContent: boolean = false;
  loadingSave: boolean = false;
  loadLabelPopover: boolean = false;

  loadTab1: boolean = false;
  loadTab2: boolean = false;
  loadTab3: boolean = false;

  kgDataSource: Observable<any>;
  kgPageSize: number = 10;
  kgSkip: number = 0;
  kgSort: SortDescriptor[] = [];
  kgState: State = {};

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notifyService: NotifyService,
    private fleetService: FleetService,
    private bindingService: BindingService
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(param => {

      this.tabName = param["option"];
      let loadData = this.vehicleId != param["id"];
      this.vehicleId = param["id"];

      this.loadingContent = false;

      if (!isUUID(this.vehicleId))
        this.router.navigate(['/user/fleet']);

      if (this.tabName == tabs.vehicle_details) {
        this.loadVehicleDetailsTab(loadData);
        this.loadTab1 = true;
      }
      else if (this.tabName == tabs.odometer_calibration) {
        this.loadOdometerTab(loadData);
        this.loadTab2 = true;
      }
      else if (this.tabName == tabs.status) {
        this.loadStatusTab(loadData);
        this.loadTab3 = true;
      }

    });

  }

  loadVehicleDetailsTab(loadData = false) {
    this.tabName = tabs.vehicle_details;
    this.loadLabelPopover = false;
    if (loadData || !this.loadTab1) {
      this.loadingContent = true;
      this.fleetService.manageVehicleById(this.vehicleId).subscribe(res => {
        let obj = res.Result;
        this.model = {
          VehicleId: obj.VehicleId,
          Name: obj.Name,
          Rego: obj.Rego,
          IsPrivateTrip: obj.IsPrivateTrip,
          IsTripTypeSwitched: obj.IsTripTypeSwitched,
          VehicleLabels: obj.VehicleLabels,
          DefaultDriverId: obj.DefaultDriverId,
          //DefaultDriver: obj.DefaultDriver,
          Drivers: obj.Drivers,
          Devices: obj.Devices,
          IMEI: obj.IMEI,
          CurrentDeviceId: obj.CurrentDeviceId
        }
        this.driverList = obj.Drivers;
        this.deviceList = obj.Devices;
        this.loadingContent = false;
      }, err => {
        this.loadingContent = false;
        this.router.navigate(['/user/fleet']);
      });
    }
  }
  loadOdometerTab(loadData = false) {
    this.tabName = tabs.odometer_calibration;
    if (loadData || !this.loadTab2) {
      this.loadingContent = true;

      this.fleetService.getOdometerById(this.vehicleId).subscribe(res => {
        this.realOdometer = this.currentOdometer = res.Result;
        this.loadingContent = false;
      }, err => {
        this.loadingContent = false;
        this.router.navigate(['/user/fleet']);
      });

      this.kgDataSource = this.fleetService.subscribeToOdometerHistory();
      this.fleetService.loadOdometerHistory(this.kgState, this.vehicleId);

    }
  }
  loadStatusTab(loadData = false) {
    this.tabName = tabs.status;
    if (loadData || !this.loadTab3) {
      this.loadingContent = true;
      this.fleetService.getVehicleStatus(this.vehicleId).subscribe(res => {
        let statusDetail = res.Result as StatusDetailModel;
        if (statusDetail.UpdateTimeUTC)
          this.vehicleStatus = getStatus(statusDetail, true) as ManageVehicleStatusModel;
        else this.vehicleStatus = null;
        this.loadingContent = false;
      }, err => {
        this.loadingContent = false;
        this.router.navigate(['/user/fleet']);
      });
    }
  }


  // *********** Vehicle details -- Tab 1 ***********
  saveVehicleDetails() {
    if (this.isDuplicateName) {
      this.notifyService.error('Vehicle Name already in use.');
      return;
    }

    this.loadingSave = true;
    this.fleetService.updateVehicle(this.model).subscribe(response => {
      this.loadingSave = false;
      this.notifyService.success("Vehicle details changed successfully.");

      // reset vehicle label list
      let newLabelList = [];
      this.model.VehicleLabels.map(l => {
        let obj = Object.assign({}, l);
        if (!obj.IsDeleted) {
          obj.IsAdded = obj.IsModified = obj.IsDeleted = false;
          newLabelList.push(obj);
        }
      });
      this.model.VehicleLabels = newLabelList;

    }, err => this.loadingSave = false);
  }
  verifyVehicleName(event: any) {
    if (event.target.value != "") {
      this.fleetService.verifyVehicleName(event.target.value, this.vehicleId).subscribe(res => {
        this.isDuplicateName = res.Result;
      });
    }
    else
      this.isDuplicateName = null;
  }
  // onDriverChange(value) {
  //   this.model.DefaultDriver = value;
  //   this.model.DefaultDriverId = value.Id;
  // }
  onTriptypeChange(e) {
    this.model.IsPrivateTrip = e.target.value;
  }
  onTriptypeSwitchChange(e) {
    this.model.IsTripTypeSwitched = e.target.value;
  }
  onSaveLabel(labelList) {
    this.model.VehicleLabels = labelList;
  }
  onDeviceFocusOut() {
    let obj = this.model.Devices.find(x => x.Name.toLowerCase() == this.model.IMEI);
    if (obj) {
      this.model.IMEI = obj.Name;
      this.model.CurrentDeviceId = obj.Id;
    }
    else {
      this.model.IMEI = null;
      this.model.CurrentDeviceId = null;
    }
  }
  onDeviceFilter(value: string) {
    this.deviceList = this.model.Devices.filter(x => x.Name.toLowerCase().includes(value.toLowerCase()));
  }
  // *********** Vehicle details -- Tab 1 ***********

  // *********** Odometer Calibration -- Tab 2 ***********
  saveCurrentOdometer() {
    if (this.realOdometer != this.currentOdometer) {
      this.loadingSave = true;
      this.fleetService.saveOdometer(this.vehicleId, this.realOdometer, this.currentOdometer).subscribe(response => {
        this.loadingSave = false;
        this.refreshGrid();
        this.realOdometer = this.currentOdometer;
        this.notifyService.success("Odometer value changed successfully.");
      }, err => this.loadingSave = false);
    }
  }

  onStateChange(state: State) {
    this.kgState = state;
    this.refreshGrid();
  }

  refreshGrid() {
    this.fleetService.loadOdometerHistory(this.kgState, this.vehicleId);
  }

  pageChange(event: PageChangeEvent) {
    this.kgSkip = event.skip;
  }

  sortChange(sort: SortDescriptor[]): void {
    this.kgSort = sort;
  }

  // *********** Odometer Calibration -- Tab 2 ***********

}
