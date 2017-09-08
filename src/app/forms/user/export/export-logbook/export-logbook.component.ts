import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from "rxjs/Subscription";

import { ScriptService } from "app/services/scripts.service";
import { TrackingLogService } from "app/forms/user/tracking-log/tracking-log.service";

import * as moment from 'moment';


@Component({
  selector: 'app-export-logbook',
  templateUrl: './export-logbook.component.html',
  styleUrls: ['./export-logbook.component.css', '../export.component.css']
})
export class ExportLogbookComponent implements OnInit, OnDestroy {

  _moment = moment;
  private subscriptions: Subscription[] = [];
  private allVehicles: any = [];
  private filteredVehicles: any = [];
  private checkedVehicleIds: Array<string> = [];
  fromDate: any = new Date();
  fromTime: any;
  displayFromTime: string = 'Any Time';
  toDate: any = new Date();
  toTime: any;
  displayToTime: string = 'Any Time';
  dateInterval: any = 'TM';
  displayDateInterval: string = moment().startOf('month').format("MMMM YYYY");
  daysOfWeek: Array<string> = ["0", "1", "2", "3", "4", "5", "6"];
  options: any = {
    driver: true,
    location: true,
    places: false,
    odometer: false,
    distance: true,
    triptype: 'both',
    duration: true,
    score: false,
    note: false,
    refuel: false,
    stoptime: false
  };
  exporttype: string = "pdf";

  constructor(private _trackingService: TrackingLogService) { }

  ngOnInit() {
    this.subscriptions.push(this._trackingService.getVehicleList().subscribe(vehicles => {
      this.allVehicles = this.filteredVehicles = vehicles.Result;
    }));
  }

  dateIntervalChange(e) {
    if (e == 'LW') {
      this.fromDate = this._moment().weekday(-6).format("ddd, MMMM DD, YYYY");
      this.toDate = this._moment().weekday(0).format("ddd, MMMM DD, YYYY");
      this.displayDateInterval = `${this.fromDate} - ${this.toDate}`;
    }
    else if (e == 'TW') {
      this.fromDate = this._moment().weekday(1).format("ddd, MMMM DD, YYYY");
      this.toDate = this._moment().format("ddd, MMMM DD, YYYY");
      this.displayDateInterval = `${this.fromDate} - ${this.toDate}`;
    }
    else if (e == 'LM') {
      this.fromDate = moment().subtract(1, 'months').startOf('month').format("ddd, MMMM DD, YYYY");
      this.toDate = moment().subtract(1, 'months').endOf('month').format("ddd, MMMM DD, YYYY");
      this.displayDateInterval = moment().subtract(1, 'months').startOf('month').format("MMMM YYYY");
    }
    else if (e == 'TM') {
      this.fromDate = moment().startOf('month').format("ddd, MMMM DD, YYYY");
      this.toDate = this._moment().format("ddd, MMMM DD, YYYY");
      this.displayDateInterval = moment().startOf('month').format("MMMM YYYY");
    }
    else if (e == 'CI') { }
  }

  daysOfWeekChange(e) {
    let value = e.target.value;
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

  fromTimeClick(e) {
    debugger;
    this.displayFromTime = e.target.text;
    this.fromTime = this._moment(e.target.attributes["data-value"].value, "HH:mm A").format();
  }

  toTimeClick(e) {
    debugger;
    this.displayToTime = e.target.text;
    this.toTime = this._moment(e.target.attributes["data-value"].value, "HH:mm A").format();
  }

  tripTypeChange(e) {

  }

  vehicleDDClick(e) {
    e.stopPropagation();
  }

  checkVehicle(vehicle) {
    debugger;
    vehicle.checked = !vehicle.checked;
    if (vehicle.checked)
      this.checkedVehicleIds.push(vehicle.VehicleId);
    else
      this.checkedVehicleIds.splice(this.checkedVehicleIds.indexOf(vehicle.VehicleId), 1);
  }

  vehicleSelectAll() {
    debugger;
    this.checkedVehicleIds = [];
    this.allVehicles.forEach(element => {
      this.checkedVehicleIds.push(element.VehicleId);
      element.checked = true;
    });
  }

  vehicleDeSelectAll() {
    this.checkedVehicleIds = [];
    this.allVehicles.forEach(element => {
      element.checked = false;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
