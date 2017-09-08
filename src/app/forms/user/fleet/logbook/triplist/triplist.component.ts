import { Subject } from 'rxjs/Subject';
import "rxjs/add/operator/takeUntil";
import { Component, OnInit, OnDestroy, Output, EventEmitter, NgZone, ViewChild, Input } from '@angular/core';
import { sumBy as _sumBy } from "lodash";
import * as moment from "moment";
import { FleetService } from "../../fleet.service";
import { colors, validateTime, errors } from "app/shared/globals";

import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { overlayConfigFactory } from 'angular2-modal';
import { environment } from "environments/environment";
import { ActivityStatusModel } from "app/model/Common";

@Component({
  selector: 'logbook-triplist',
  templateUrl: './triplist.Component.html'
})

export class TriplistComponent implements OnInit, OnDestroy {

  _err = errors;
  _sumBy = _sumBy;
  _moment = moment;
  ngUnsubscribe: Subject<void> = new Subject<void>();

  logbookData: any = null;
  loadingTrips: boolean = false;
  loadingTripChange: boolean = false;
  tripColors = colors;
  dateValue: Date = new Date();

  selectedTrip: any = null;
  selectedTripIndex: number = null;
  imgUrlPrefix: string = environment.origin + 'Content/';

  @Input() rangeFilter: any;
  @Output() dateChange = new EventEmitter();
  @Output() applyFilter = new EventEmitter();
  @ViewChild("filterForm") filterForm;

  startTimeValue: string = "";
  endTimeValue: string = "";
  openFilter: boolean = false;

  constructor(
    private zone: NgZone,
    private fleetService: FleetService,
    private modal: Modal
  ) { }

  ngOnInit() {
    this.loadingTrips = true;
    this.onEscKeyUp();

    // subscribe to vehicle details
    this.fleetService.subscribeToVehicleDetail().takeUntil(this.ngUnsubscribe).subscribe(res => {

      if (res && res.resetData)
        this.hideTripInfoBox();
      if (res) {
        this.loadingTrips = false;
        this.logbookData = res.data;

        if (this.selectedTripIndex != null && !res.resetData) {
          var vehicleTrip = this.logbookData.VehicleTrips[this.selectedTripIndex];
          this.selectedTrip = vehicleTrip;
          this.fleetService.setVehicleTrip(this.selectedTrip);
        }

      }
      else this.hideTripInfoBox();
    }, err => this.loadingTrips = false);

    // subscribe to display vehicle trip
    this.fleetService.subscribeToVehicleTrip().takeUntil(this.ngUnsubscribe).subscribe(res => {
      this.zone.run(() => {
        if (res) {
          this.selectedTrip = res;
          this.selectedTripIndex = this.logbookData.VehicleTrips.findIndex(x => x.VehicleTripId == res.VehicleTripId);
        }
        else {
          this.selectedTrip = null;
          this.selectedTripIndex = null;
        }
      });
    });

  }

  onDateChange(value: Date) {
    value = new Date(value);
    this.loadingTrips = true;
    this.dateValue = value;
    this.startTimeValue = this.endTimeValue = "";
    this.filterForm.resetForm();
    this.dateChange.emit(value);
  }

  prevDate() {
    if (!this.loadingTrips) {
      this.loadingTrips = true;
      var d = new Date(this.dateValue);
      d.setDate(d.getDate() - 1);
      this.dateValue = d;
      this.onDateChange(this.dateValue);
      this.hideTripInfoBox();
    }
  }

  nextDate() {
    if (!this.loadingTrips) {
      this.loadingTrips = true;
      var d = new Date(this.dateValue);
      d.setDate(d.getDate() + 1);
      this.dateValue = d;
      this.onDateChange(this.dateValue);
      this.hideTripInfoBox();
    }
  }

  // show trip info box
  showTripInfoBox(vehicleTrip) {
    this.selectedTrip = vehicleTrip;
    this.selectedTripIndex = this.logbookData.VehicleTrips.findIndex(x => x.VehicleTripId == vehicleTrip.VehicleTripId);
    this.fleetService.setVehicleTrip(this.selectedTrip);
  }

  // hide trip info box
  hideTripInfoBox() {
    this.selectedTrip = null;
    this.selectedTripIndex = null;
    this.fleetService.setVehicleTrip(null);
  }

  nextTrip() {
    if (this.selectedTripIndex < this.logbookData.VehicleTrips.length - 1) {
      this.selectedTripIndex += 1;
      var vehicleTrip = this.logbookData.VehicleTrips[this.selectedTripIndex];
      this.selectedTrip = vehicleTrip;
      this.fleetService.setVehicleTrip(this.selectedTrip);
    }
  }

  prevTrip() {
    if (this.selectedTripIndex > 0) {
      this.selectedTripIndex -= 1;
      var vehicleTrip = this.logbookData.VehicleTrips[this.selectedTripIndex];
      this.selectedTrip = vehicleTrip;
      this.fleetService.setVehicleTrip(this.selectedTrip);
    }
  }

  // handle Esc key event
  onEscKeyUp() {
    let that = this;
    document.addEventListener('keyup', function (e) {
      var code = (e.keyCode ? e.keyCode : e.which);
      if (code === 27 && that.selectedTrip)
        that.hideTripInfoBox();
    });
  }

  // time filter
  filterTrip(startDt, endDt) {
    this.openFilter = false;
    this.applyFilter.emit({ startDate: startDt, endDate: endDt });
  }
  // clear time filter
  clearFilter() {
    this.openFilter = false;
    this.startTimeValue = this.endTimeValue = "";
    this.filterForm.resetForm();
    this.applyFilter.emit(null);
  }

  changeTrip(tripId) {
    this.loadingTripChange = true;
    this.fleetService.changeVehicleTrip(tripId).subscribe(res => {
      let obj = this.logbookData.VehicleTrips.find(x => x.VehicleTripId == tripId);
      if (obj)
        obj.IsPrivateTrip = !obj.IsPrivateTrip;
      this.loadingTripChange = false;
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}