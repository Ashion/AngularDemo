import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { People } from "../../../../model/PeopleModel";
import { PeopleService } from "app/forms/user/people/people.service";
import { NotifyService } from "app/services/notification.service";
import { DropDownModel } from "app/model/DropDownModel";
import { ConfirmPopup } from "app/components/wrapper/confirm-popup";
import { FileRestrictions, SelectEvent, ClearEvent, RemoveEvent } from '@progress/kendo-angular-upload';
import { FileStorageModel } from '../../../../model/FileStorageModel';
import { environment } from "environments/environment";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['../../export/export.component.css']
})

export class DetailComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  model: any = {};
  loading: boolean = false;
  public paramId: string;
  public sourceDriverTagList: Array<DropDownModel> = [];
  public IsEmailAvailable: boolean = false;
  public securityRoleDropDown: Array<DropDownModel> = [];
  public securityRole: DropDownModel;
  public UpdatedEmailAddress: string = "";
  public OldCanlogin: boolean = false;
  public imageFile: FileStorageModel = new FileStorageModel();
  public uploadFileObj: FileStorageModel = null;
  public deletedFileObj: FileStorageModel = null;
  public SecurityRole: DropDownModel;
  public HomePageDropDown: Array<DropDownModel> = [];
  public clientGroupDropDown: Array<DropDownModel> = [];
  private checkedVehicleIds: Array<string> = [];
  private filteredVehicles: any = [];
  private allClientGroup: any = [];
  public groupData: Array<DropDownModel> = [];
  public defaultGroup: DropDownModel = { Id: null, Name: "Select Group" };
  private allVehicles: any = [];

  constructor(private route: ActivatedRoute, private confirmPopup: ConfirmPopup, private router: Router, private peopleService: PeopleService, private _notify: NotifyService) { }

  ngOnInit() {
    this.model.checkedVehicleIds = [];
    this.subscriptions.push(this.peopleService.getClientGroupList().subscribe(clientgroup => {
      this.groupData = clientgroup.Result;
    }));
    this.model.IsDriver = 1;
    this.HomePageDropDown = [{ Id: "/user/dashboard", Name: "Dashboard" }, { Id: "/user/tracking-log", Name: "Tracking Log" }];
    this.model.HomePageUrl = this.HomePageDropDown[0];
    this.SecurityRole = { Id: null, Name: "Select Security Role" };
    this.model.options = 1;
    this.route.params.subscribe(param => this.paramId = param["clientId"]);
    this.peopleService.getSecurityRoles().subscribe(x => this.securityRoleDropDown = <Array<DropDownModel>>x.Result);
    this.peopleService.driverTagList("", "").subscribe(x => this.sourceDriverTagList = x.Result);
    if (this.paramId.toString() != "new") {
      this.peopleService.getPersonById(this.paramId).subscribe(
        response => {
          this.model = <People>response.Result;
          let file = this.model.Photo;
          if (file)
            file.FileAccessUrl = environment.origin + 'Content/' + file.FileAccessUrl;
          this.model.HomePageUrl = (this.model.DefaultUrl != "" && this.model.DefaultUrl != null) ?
            this.HomePageDropDown.find(x => x.Id == this.model.DefaultUrl) : this.HomePageDropDown[0];
          this.imageFile = file;
          this.OldCanlogin = this.model.CanLogin;
          this.UpdatedEmailAddress = this.model.EmailAddress;
          this.securityRole = { Id: this.model.SecurityRoleId, Name: this.model.SecurityRole };
          this.model.options = (this.model.CanLogin) ? 1 : 0;
          this.model.Group = this.groupData.find(x => x.Id == response.Result.ClientGroupId);
          this.model.IsDriver = (response.Result.IsDriver) ? 1 : 0;
          this.setVehicleList(this.model.Group.Id, response.Result.VehicleList);
        });
    }
  }

  private setVehicleList(GroupId: string, vehicleList: Array<string>) {
    this.model.checkedVehicleIds = [];
    this.subscriptions.push(this.peopleService.getVehicleList(GroupId).subscribe(vehicles => {
      this.allVehicles = this.filteredVehicles = vehicles.Result;
      this.filteredVehicles.forEach(element => {
        let dataObj = vehicleList.find(x => x == element.VehicleId);
        if (dataObj != null) {
          element.checked = true;
          this.model.checkedVehicleIds.push(element.VehicleId);
        }
        else {
          element.checked = false;
        }
      });
    }));
  }


  save() {
    var peopleModel = new People();
    if (this.IsEmailAvailable) {
      this._notify.error("Email already exists", "Person Detail");
    }
    else if (this.model.options && this.model.SecurityRole.Id == null) {
      this._notify.error("Please select Role", "Person Detail");
    }
    else {
      peopleModel = this.model;
      peopleModel.SecurityRole = this.model.SecurityRole;
      peopleModel.PeopleId = this.paramId;
      peopleModel.CanLogin = this.model.options ? true : false;
      peopleModel.DefaultUrl = this.model.HomePageUrl.Id;
      // File upload ============
      peopleModel.Photo = this.uploadFileObj || null;
      peopleModel.DeletedPhoto = this.deletedFileObj || null;
      // ============= File upload
      peopleModel.IsDriver = this.model.IsDriver == 1;
      peopleModel.ClientGroupId = this.model.Group.Id;
      peopleModel.VehicleList = this.model.checkedVehicleIds;
      if (!this.model.CanLogin && this.OldCanlogin) {
        this.confirmPopup.openConfirmation("This user will not be able to login anymore. Are you sure to update?").then(res => {
          this.AddOrUpdate(peopleModel);
        });
      }
      else {
        this.AddOrUpdate(peopleModel);
      }
    }
  }

  private AddOrUpdate(peopleModel: any) {
    this.loading = true;
    this.peopleService.addOrUpdate(peopleModel).subscribe(
      response => {
        this.loading = false;
        if (response.Result) {
          if (peopleModel.PeopleId == 'new') {
            this._notify.success("Person added successfully.");
          }
          else {
            this._notify.success("Person updated successfully.");
          }

          setTimeout(() => {
            this.router.navigate(['/user/people']);
          }, 1500);
        }
      });
  }
  onCancleClick() {
    this.router.navigate(['/user/people']);
  }

  handleFilter(value) {
    this.peopleService.driverTagList(value.toLowerCase(), (this.paramId == "new") ? "" : this.paramId).subscribe(x => {
      this.sourceDriverTagList = [];
      this.sourceDriverTagList = x.Result;
      if (this.sourceDriverTagList.length == 0) {
        this.model.TagCode = null;
      }
    });
  }

  public emailValidation() {
    if (this.model.EmailAddress != undefined) {
      if (this.paramId.toString().toLowerCase() != "new" && this.UpdatedEmailAddress.toLowerCase() == this.model.EmailAddress.toLowerCase()) {
        this.IsEmailAvailable = false;
      }
      else {
        this.peopleService.VerifyEmail(this.model.EmailAddress.toLowerCase()).subscribe(x => {
          this.IsEmailAvailable = (x.Result) ? true : false;
        });
      }
    }
  }

  // File upload ============
  onSelectFile(obj: FileStorageModel) {
    this.uploadFileObj = obj;
  }
  onRemoveFile(obj: FileStorageModel) {
    if (this.model.PhotoId)
      this.deletedFileObj = obj;
    this.uploadFileObj = null;
  }
  // ============= File upload



  // Vehicle select De select 
  vehicleDDClick(e) {
    e.stopPropagation();
  }
  checkVehicle(vehicle) {
    vehicle.checked = !vehicle.checked;
    if (vehicle.checked)
      this.model.checkedVehicleIds.push(vehicle.VehicleId);
    else
      this.model.checkedVehicleIds.splice(this.model.checkedVehicleIds.indexOf(vehicle.VehicleId), 1);
  }

  vehicleSelectAll() {
    this.model.checkedVehicleIds = [];
    this.allVehicles.forEach(element => {
      this.model.checkedVehicleIds.push(element.VehicleId);
      element.checked = true;
    });
  }

  vehicleDeSelectAll() {
    this.model.checkedVehicleIds = [];
    this.allVehicles.forEach(element => {
      element.checked = false;
    });
  }

  groupChange(event: any) {
    if (event.Id != null) {
      this.subscriptions.push(this.peopleService.getVehicleList(event.Id).subscribe(vehicles => {
        this.vehicleDeSelectAll();
        this.allVehicles = this.filteredVehicles = vehicles.Result;
      }));
    }
    else {
      this.vehicleDeSelectAll();
    }
  }
}
