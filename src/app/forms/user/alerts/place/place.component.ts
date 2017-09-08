import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlaceAlertModel } from 'app/model/Alert';
import { DropDownModel } from 'app/model/DropDownModel';
import { NotifyService } from 'app/services/notification.service';
import { errors, fromTimes, toTimes } from 'app/shared/globals';
import { sortBy as _sortBy } from 'lodash';
import * as moment from 'moment';
import { AlertService } from '../alerts.service';

@Component({
  selector: 'alerts-type-place',
  templateUrl: './place.component.html'
})

export class PlaceComponent implements OnInit {

  _err = errors;
  alertModel: PlaceAlertModel = new PlaceAlertModel();

  allVehicles: Array<any> = [];
  filteredVehicles: Array<any> = [];
  searchVehicleText: string = "";
  loadVehiclePopover: boolean = false;

  allPlaces: Array<DropDownModel> = [];
  filteredPlaces: Array<DropDownModel> = [];

  daysOfWeek: Array<number> = [0, 1, 2, 3, 4, 5, 6];

  allUsers: Array<any> = [];
  filteredUsers: Array<any> = [];
  searchUserText: string = "";
  loadUserPopover: boolean = false;

  allUsersSMS: Array<any> = [];
  filteredUsersSMS: Array<any> = [];
  searchUserSMSText: string = "";
  loadUserSMSPopover: boolean = false;

  additionalEmail: string = "";
  additionalPhone: string = "";

  fromTimeList: Array<any> = fromTimes;
  toTimeList: Array<any> = toTimes;

  additionalCountry: string = "";
  countryList: Array<any> = [];

  loadingSave: boolean = false;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private notifyService: NotifyService
  ) { }

  ngOnInit() {
    this.alertModel.TempStartDate = moment().toDate();
    this.alertModel.TempEndDate = moment().add(7, 'd').toDate();

    this.alertService.getPlaceBinding().subscribe(res => {
      this.allPlaces = this.filteredPlaces = res.Result.placeList;
      this.allVehicles = this.filteredVehicles = res.Result.vehicleList;

      res.Result.userList.map(u => {
        if (u.EmailAddress)
          this.allUsers.push(Object.assign({}, u));
        if (u.PhoneNumber)
          this.allUsersSMS.push(Object.assign({}, u));
      });
      this.filteredUsers = this.allUsers;
      this.filteredUsersSMS = this.allUsersSMS;

      this.countryList = res.Result.countryList;
      this.additionalCountry = res.Result.defaultCountry;

    });
  }

  // -------- Vehicle Popover ----------//
  vehicleChecked(vehicle) {
    vehicle.checked = !vehicle.checked;
    if (vehicle.checked)
      this.alertModel.VehicleIds.push(vehicle.VehicleId);
    else
      this.alertModel.VehicleIds.splice(this.alertModel.VehicleIds.indexOf(vehicle.VehicleId), 1);
  }
  vehicleSearch(value: string) {
    this.searchVehicleText = value;
    this.filteredVehicles = this.allVehicles.filter(p => p.Name.toLowerCase().includes(value.toLowerCase()));
  }
  vehicleSelectAll() {
    this.alertModel.VehicleIds = [];
    this.allVehicles.forEach(element => {
      this.alertModel.VehicleIds.push(element.VehicleId);
      element.checked = true;
    });
  }
  vehicleClearAll() {
    this.alertModel.VehicleIds = [];
    this.allVehicles.forEach(element => {
      element.checked = false;
    });
  }
  // -------- Vehicle Popover ----------//


  // -------- User Email Popover ----------//
  userChecked(user) {
    user.checked = !user.checked;
    if (user.checked)
      this.alertModel.UserIds.push(user.PeopleId);
    else
      this.alertModel.UserIds.splice(this.alertModel.UserIds.indexOf(user.PeopleId), 1);
  }
  userSearch(value: string) {
    this.searchUserText = value;
    this.filteredUsers = this.allUsers.filter(p => p.Name.toLowerCase().includes(value.toLowerCase()));
  }
  userSelectAll() {
    this.alertModel.UserIds = [];
    this.allUsers.forEach(element => {
      this.alertModel.UserIds.push(element.PeopleId);
      element.checked = true;
    });
  }
  userClearAll() {
    this.alertModel.UserIds = [];
    this.allUsers.forEach(element => {
      element.checked = false;
    });
  }
  // -------- User Email Popover ----------//


  // -------- User Phone Number Popover ----------//
  userSMSChecked(user) {
    user.checked = !user.checked;
    if (user.checked)
      this.alertModel.UserSMSIds.push(user.PeopleId);
    else
      this.alertModel.UserSMSIds.splice(this.alertModel.UserSMSIds.indexOf(user.PeopleId), 1);
  }
  userSMSSearch(value: string) {
    this.searchUserSMSText = value;
    this.filteredUsersSMS = this.allUsersSMS.filter(p => p.Name.toLowerCase().includes(value.toLowerCase()));
  }
  userSMSSelectAll() {
    this.alertModel.UserSMSIds = [];
    this.allUsersSMS.forEach(element => {
      this.alertModel.UserSMSIds.push(element.PeopleId);
      element.checked = true;
    });
  }
  userSMSClearAll() {
    this.alertModel.UserSMSIds = [];
    this.allUsersSMS.forEach(element => {
      element.checked = false;
    });
  }
  // -------- User Phone Number Popover ----------//


  alertGenerateOn(event: any) {
    let value = event.target.value;
    this.alertModel.GenerateOnEntry = (value == 1 || value == 3);
    this.alertModel.GenerateOnExit = (value == 2 || value == 3);
  }

  filterPlaces(value: string): void {
    this.filteredPlaces = this.allPlaces.filter(p => p.Name.toLowerCase().includes(value.toLowerCase()));
  }

  daysOfWeekChange(e) {
    let value = parseInt(e.target.value);
    let index = this.daysOfWeek.indexOf(value);
    if (index != -1) {
      this.daysOfWeek.splice(index, 1);
      e.target.parentElement.classList.remove("active");
    }
    else {
      this.daysOfWeek.push(value);
      e.target.parentElement.classList.add("active");
    }
  }

  // ---------- Additional Email Recipients -------------- //
  addEmail() {
    if (this.additionalEmail.trim()) {
      let index = this.alertModel.AdditionalEmail.indexOf(this.additionalEmail);
      if (index == -1) this.alertModel.AdditionalEmail.push(this.additionalEmail);
      this.additionalEmail = "";
    }
  }
  removeEmail(index) {
    this.alertModel.AdditionalEmail.splice(index, 1);
  }
  // ---------- Additional Email Recipients -------------- //


  // ---------- Additional Phone Number Recipients -------------- //
  addPhone() {
    if (this.additionalPhone.trim() && this.additionalCountry != null) {
      let countryObj = this.countryList.find(x => x.Id == this.additionalCountry);
      let obj = this.alertModel.AdditionalPhone.find(x => x.CountryId == this.additionalCountry && x.PhoneNumber == this.additionalPhone.trim());
      if (!obj) this.alertModel.AdditionalPhone.push({ CountryId: this.additionalCountry, CountryCode: countryObj.CountryCode, PhoneNumber: this.additionalPhone.trim() });
      this.additionalPhone = "";
    }
  }
  removePhone(index) {
    this.alertModel.AdditionalPhone.splice(index, 1);
  }
  // ---------- Additional Phone Number Recipients -------------- //

  createAlert() {
    this.alertModel.GenerateOnDays = this.daysOfWeek.length == 0 ? null : _sortBy(this.daysOfWeek).join(',');
    if (!this.alertModel.IsTemporary) {
      this.alertModel.TempStartDate = null;
      this.alertModel.TempEndDate = null;
    }

    if (this.alertModel.FromTime == null || this.alertModel.ToTime == null)
      this.alertModel.FromTime = this.alertModel.ToTime = null;

    if (this.alertModel.VehicleIds.length == 0 || (!this.alertModel.IsTemporary && this.daysOfWeek.length == 0) ||
      this.alertModel.UserIds.length + this.alertModel.UserSMSIds.length + this.alertModel.AdditionalEmail.length + this.alertModel.AdditionalPhone.length == 0)
      return true;

    this.loadingSave = true;
    this.alertService.save(this.alertModel).subscribe(response => {
      this.loadingSave = false;
      this.notifyService.success("Place alert created successfully.");
      this.router.navigate(['/user/alerts']);
    }, err => this.loadingSave = false);
  }

}
