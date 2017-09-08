import { Component, OnInit } from '@angular/core';
import { NotifyService } from "app/services/notification.service";
import { DeviceService } from "app/forms/admin/device/device.service";
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmPopup } from "app/components/wrapper/confirm-popup";
import { DropDownViewModel, AssignOrUnassignViewModel } from "app/model/ClientModel";
import { BindingService } from "app/services/binding.service";
import { MapiconListViewModel, DeviceViewModel, DeviceEntityViewModel } from "app/model/DeviceModel";

@Component({
  selector: 'device-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  public paramId: string;
  model: any = {};
  public purchaseDate: Date;
  public isEntity: boolean = true;
  public isDuplicateSimId: any = null;
  public isDuplicateImei: any = null;
  public IsSelected: boolean = true;

  // Enable - Disable 
  public isClient: boolean = false;
  public isGroup: boolean = true;
  public isVehicle: boolean = true;
  public isAsset: boolean = true;
  public isMapicon: boolean = true;
  public isTrackColor: boolean = true;

  // Model Dropdown
  public modelData: Array<AssignOrUnassignViewModel> = [];
  public modelSource: Array<AssignOrUnassignViewModel> = [];

  // Carrier Dropdown 
  public carrierData: Array<AssignOrUnassignViewModel> = [];
  public carrierSource: Array<AssignOrUnassignViewModel> = [];

  // Dropdown
  public pndModeData: Array<DropDownViewModel> = [];
  public conditionData: Array<DropDownViewModel> = [];
  public entityTypeData: Array<DropDownViewModel> = [];
  public mapiconData: Array<MapiconListViewModel> = [];

  // Client Dropdown
  public clientData: Array<AssignOrUnassignViewModel> = [];
  public clientSource: Array<AssignOrUnassignViewModel> = [];

  // Group Dropdown
  public groupData: Array<AssignOrUnassignViewModel> = [];
  public groupSource: Array<AssignOrUnassignViewModel> = [];
  // HardwareProfile Dropdown
  public hardwareProfileData: Array<AssignOrUnassignViewModel> = [];
  public hardwareProfileSource: Array<AssignOrUnassignViewModel> = [];

  // Vehicle Dropdown
  public vehicleData: Array<DeviceEntityViewModel> = [];
  public vehicleSource: Array<DeviceEntityViewModel> = [];
  // Asset Dropdown
  public assetData: Array<DeviceEntityViewModel> = [];
  public assetSource: Array<DeviceEntityViewModel> = [];

  constructor(private notifyService: NotifyService, private bindingService: BindingService, private deviceService: DeviceService, private route: ActivatedRoute, private router: Router, private confirmPopup: ConfirmPopup) {
    this.conditionData = deviceService.setConditionSet();
    this.entityTypeData = deviceService.setEntityTypeSet();
    this.pndModeData = deviceService.setPNDModeSet();
  }

  ngOnInit() {
    this.model.Conditions = this.conditionData[0];
    this.model.Entity = {};
    this.model.PndMode = this.pndModeData[0];
    this.model.MapIconId = "";
    this.model.Entity = this.entityTypeData[1];
    this.model.IsItemStatus = true;
    this.route.params.subscribe(param => this.paramId = param["deviceId"].toLowerCase());

    if (this.paramId != "new") {
      this.deviceService.getById(this.paramId).subscribe(response => {
        this.model.DeviceId = response.Result.DeviceId;
        this.model.Imei = response.Result.Imei;
        this.model.SimId = response.Result.SimId;
        this.model.Script = response.Result.Script;
        this.model.InventorySku = response.Result.InventorySku;
        this.model.Firmware = response.Result.Firmware;
        this.model.RmaCode = response.Result.RmaCode;
        this.model.ReportingFrequency = response.Result.ReportingFrequency;
        this.model.Phone = response.Result.Phone;
        this.model.ServicePlanId = response.Result.ServicePlanId;
        let tempCondition = this.deviceService.setConditionSet().find(x => x.Id == response.Result.Condition); // Condition dropdown 
        if (tempCondition != undefined)
          this.model.Conditions = { Id: tempCondition.Id, Name: tempCondition.Name };
        this.purchaseDate = new Date(response.Result.PurchaseDate);  // Purchase date         
        let tempEntity = this.deviceService.setEntityTypeSet().find(x => x.Id == response.Result.EntityType);        // Entity 
        if (tempEntity != undefined) {
          this.model.Entity = { Id: tempEntity.Id, Name: tempEntity.Name };
          this.isEntity = !(tempEntity.Id == "0");
        }
        let tempPnd = this.deviceService.setPNDModeSet().find(x => x.Id == response.Result.PndMode); // PND MODE 
        if (tempPnd != undefined)
          this.model.PndMode = { Id: tempPnd.Id, Name: tempPnd.Name };
        this.model.IsItemStatus = response.Result.IsEnabled; // ITEM Status
        this.model.MapIconId = response.Result.MapIconId;
        if (response.Result.TraceColor != "") {
          this.model.TraceColor = response.Result.TraceColor;
        }
        this.model.DeviceKey = response.Result.DeviceKey;
      });
    }

    // Model dropdown binding 
    this.deviceService.getModelList((this.paramId == "new") ? "" : this.paramId).subscribe(
      modelList => {
        this.modelSource = modelList.Result;
        this.modelData = this.modelSource.slice();
        this.modelData.forEach(element => {
          if (element.IsPeopleAssign) {
            this.model.Models = { RoleName: element.RoleName, RoleId: element.RoleId, IsPeopleAssign: element.IsPeopleAssign };
          }
        });
      });
    // Carrier dropdown binding    
    this.deviceService.getCarrierList((this.paramId == "new") ? "" : this.paramId).subscribe(
      carrierList => {
        this.carrierSource = carrierList.Result;
        this.carrierData = this.carrierSource.slice();
        this.carrierData.forEach(element => {
          if (element.IsPeopleAssign) {
            this.model.Carriers = { RoleName: element.RoleName, RoleId: element.RoleId, IsPeopleAssign: element.IsPeopleAssign };
          }
        });
      });
    // Client and group dropdown binding
    this.deviceService.getClientById((this.paramId == "new") ? "" : this.paramId).subscribe(response => {
      this.clientSource = response.Result;
      this.clientData = this.clientSource.slice();
      this.clientData.forEach(element => {
        if (element.IsPeopleAssign) {
          this.model.Clients = { RoleName: element.RoleName, RoleId: element.RoleId, IsPeopleAssign: element.IsPeopleAssign };
          this.onClientChange(this.model.Clients);
        }
      });
    });
    // Hardware dropdown binding
    this.deviceService.getHardwareProfile((this.paramId == "new") ? "" : this.paramId).subscribe(response => {
      this.hardwareProfileSource = response.Result;
      this.hardwareProfileData = this.hardwareProfileSource.slice();
      this.hardwareProfileData.forEach(element => {
        if (element.IsPeopleAssign) {
          this.model.HardwareProfiles = { RoleName: element.RoleName, RoleId: element.RoleId, IsPeopleAssign: element.IsPeopleAssign };
        }
      });
    });
  }

  public groupChange(event: any) {
    this.model.Vehicle = null;
    this.model.Asset = null;

    if (event != undefined && event.RoleId != null) {
      this.isMapicon = true;
      this.isTrackColor = true;
      this.isAsset = false;
      this.isVehicle = false;

      // Asset dropdown binding 
      this.deviceService.getAssetList(event.RoleId).subscribe(response => {
        this.assetSource = response.Result;
        this.assetData = this.assetSource.slice();
        if (this.assetData.length > 0) {
          this.isMapicon = false;
          this.isTrackColor = false;
        }
        this.assetData.forEach(element => {
          if (element.CurrentDeviceId == this.paramId) {
            this.model.Asset = { Name: element.Name, Id: element.Id, CurrentDeviceId: element.CurrentDeviceId };
          }
        });
      });

      // Vehicle dropdown binding
      this.deviceService.getvehicleList(event.RoleId).subscribe(response => {
        this.vehicleSource = response.Result;
        this.vehicleData = this.vehicleSource.slice();
        if (this.vehicleData.length > 0) {
          this.isMapicon = false;
          this.isTrackColor = false;
        }
        this.vehicleData.forEach(element => {
          if (element.CurrentDeviceId == this.paramId) {
            this.model.Vehicle = { Name: element.Name, Id: element.Id, CurrentDeviceId: element.CurrentDeviceId };
          }
        });
      });

      this.deviceService.getMapicon((this.paramId == "new") ? "" : this.paramId).subscribe(response => {
        this.mapiconData = <Array<MapiconListViewModel>>response.Result;
        this.mapiconData.forEach(element => {
          if (element.Id == this.model.MapIconId) {
            this.model.MapIcon = { Id: element.Id, Name: element.Name, Url: element.Url, IsAssign: element.IsAssign };
          }
        });
      });
    }
    else {
      this.model.MapIcon = null;
      this.isVehicle = true;
      this.isAsset = true;
      this.isMapicon = true;
      this.isTrackColor = true;
    }
  }

  protected FilterChange(filter: any, type: string): void {
    debugger;
    switch (type) {
      case "model":
        this.modelData = this.modelSource.filter((s) => s.RoleName.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
        break;
      case "carrier":
        this.carrierData = this.carrierSource.filter((s) => s.RoleName.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
        break;
      case "client":
        this.clientData = this.clientSource.filter((s) => s.RoleName.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
        break;
      case "group":
        this.groupData = this.groupSource.filter((s) => s.RoleName.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
        break;
      case "hardware":
        this.hardwareProfileData = this.hardwareProfileSource.filter((s) => s.RoleName.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
        break;
      case "vehicle":
        this.vehicleData = this.vehicleSource.filter((s) => s.Name.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
        break;
      case "asset":
        this.assetData = this.assetSource.filter((s) => s.Name.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
        break;
      default:
        break;
    }
  }

  protected onClientChange(event: any) {
    this.isGroup = true;
    this.isVehicle = true;
    this.isAsset = true;
    this.isMapicon = true;
    this.isTrackColor = true;
    this.model.Group = null;
    this.model.Vehicle = null;
    this.model.Asset = null;
    this.model.MapIcon = null;
    if (event != undefined && event.RoleId != null) {
      this.deviceService.getGroupById(this.paramId, event.RoleId).subscribe(response => {
        this.groupSource = response.Result;
        this.groupData = this.groupSource.slice();
        this.isGroup = false;
        this.groupData.forEach(element => {
          if (element.IsPeopleAssign) {
            this.model.Group = { RoleName: element.RoleName, RoleId: element.RoleId, IsPeopleAssign: element.IsPeopleAssign };
            this.groupChange(this.model.Group);
          }
        });
      });
    }
  }

  protected imageChanges(event: any) {
    if (event != undefined && event.Url != "") {
      this.model.MapIcon = { Id: event.Id, Name: event.Name, Url: event.Url, IsAssign: event.IsAssign };;
    }
    else {
      this.model.MapIcon = null;
    }
  }

  public save() {
    if (this.isDuplicateImei) {
      this.notifyService.error("Please enter unique IMEI number");
    }
    else {
      if (this.isDuplicateSimId) {
        this.notifyService.error("Please enter unique SIM ID");
      }
      else {
        if (this.model.Models == undefined || this.model.Models.RoleId == null) {
          this.notifyService.error("Please select Model");
        }
        else {
          if (this.model.HardwareProfiles == undefined || this.model.HardwareProfiles.RoleId == null) {
            this.notifyService.error("Please select HardwareProfiles");
          }
          else {
            if (this.model.Clients != null && this.model.Clients.RoleId != null && (this.model.Group == null || this.model.Group.RoleId == null)) {
              this.notifyService.error("Please correct highlighted fields");
              this.IsSelected = false;
            }
            else if (this.model.Clients != null && this.model.Clients.RoleId != null && ((this.model.Group == null || this.model.Group.RoleId == null) || (this.model.Entity.Name == "Vehicle") ? (this.model.Vehicle == null || this.model.Vehicle.Id == null) : (this.model.Asset == null || this.model.Asset.Id == null))) {
              this.notifyService.error("Please correct highlighted fields");
              this.IsSelected = false;
            }
            else {
              let isEntityAssign: boolean = false;
              if (this.model.Vehicle != null && this.model.Vehicle.Id != null) {
                let tempObj = this.vehicleSource.find(x => x.Id == this.model.Vehicle.Id);
                if (tempObj != null && tempObj.CurrentDeviceId != null && tempObj.CurrentDeviceId != this.paramId) {
                  isEntityAssign = true;
                }
              }
              if (this.model.Asset != null && this.model.Asset.Id != null) {
                let tempObj = this.assetSource.find(x => x.Id == this.model.Asset.Id);
                if (tempObj != null && tempObj.CurrentDeviceId != null && tempObj.CurrentDeviceId != this.paramId) {
                  isEntityAssign = true;
                }
              }
              if (isEntityAssign) {
                this.confirmPopup.openConfirmation((this.model.Vehicle != null && this.model.Vehicle.Id != null) ? "Are you sure to update current device to the Vehicle " + this.model.Vehicle.Name : "Are you sure to update current device to the Asset " + this.model.Asset.Name).then(res => {
                  this.updateDevice();
                });
              }
              else {
                this.updateDevice();
              }
            }
          }
        }
      }
    }
  }

  private updateDevice() {
    this.model.PurchaseDate = <Date>this.purchaseDate;
    let data = <DeviceViewModel>this.model;
    if (this.model.Conditions != undefined)
      data.ConditionId = parseInt(this.model.Conditions.Id);
    data.PndMode.Name = this.model.PndMode.Id;
    data.IsEnabled = this.model.IsItemStatus;
    if (this.model.HardwareProfiles == undefined || this.model.HardwareProfiles.RoleId == null) {
      this.model.HardwareProfiles = null;
    }
    if (this.model.Carriers == undefined || this.model.Carriers.RoleId == null) {
      this.model.Carriers = null;
    }
    if (this.model.Clients == undefined || this.model.Clients.RoleId == null) {
      this.model.Clients = null;
    }
    this.deviceService.addOrUpdate(data).subscribe(response => {
      if (response.Result) {
        this.router.navigate(['/admin/tools/device']);
        this.notifyService.success("Device " + ((this.paramId != "new") ? " updated successfully." : "added successfully."));
      }
    });
  }

  protected verifySimId(event: any) {
    if (event.target.value != "") {
      this.deviceService.verifySimId(event.target.value, this.paramId).subscribe(res => {
        this.isDuplicateSimId = res.Result;
      });
    }
    else
      this.isDuplicateSimId = null;
  }

  protected verifyImei(event: any) {
    if (event.target.value != "") {
      this.deviceService.verifyImei(event.target.value, this.paramId).subscribe(res => {
        this.isDuplicateImei = res.Result;
      });
    }
    else {
      this.isDuplicateImei = null;
      this.model.Imei = null;
    }
  }

  protected imeiKeyPress(event: any) {
    return (!(((event.keyCode > 96 && event.keyCode < 122) || (event.keyCode > 64 && event.keyCode < 90) || (event.keyCode > 47 && event.keyCode <= 57) || (event.keyCode == 8)))) ? false : true;
  }
  protected changeSimIdInputStyle(): any {
    let color = '';
    if (this.isDuplicateSimId == true)
      color = 'Red';
    else if (this.isDuplicateSimId == false)
      color = 'Green';
    return { 'border-color': color };
  }

  protected changeImeiInputStyle(): any {
    let color = '';
    if (this.isDuplicateImei == true)
      color = 'Red';
    else if (this.isDuplicateImei == false)
      color = 'Green';
    return { 'border-color': color };
  }

  public vehicleChange(event: any) {
    debugger;
    if (event == undefined || event.Id == null) {
      this.isMapicon = true;
      this.isTrackColor = true;
      this.model.MapIcon = null;
    }
    else {
      this.isMapicon = false;
      this.isTrackColor = false;
    }
  }

  public checkReportNumber(event: any) {
    if ((event.target.value > 31 && (event.keyCode < 48 || event.keyCode > 57))) {
      this.model.ReportingFrequency = 0;
    }
  }
}
