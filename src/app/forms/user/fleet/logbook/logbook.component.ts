import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs/Subject';
import "rxjs/add/operator/takeUntil";
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { map as _map } from "lodash";
import * as moment from 'moment';

import { FleetService } from "../fleet.service";
import { MapService } from '../../../../services/map.service';
import * as io from "socket.io-client";
import { environment } from "environments/environment";
import { dtToTimezone, getStatus } from "app/shared/globals";

@Component({
  selector: 'fleet-logbook',
  templateUrl: './logbook.component.html',
  providers: [DatePipe]
})

export class LogbookComponent implements OnInit, OnDestroy {

  socket = io.connect(environment.socketURL);
  ngUnsubscribe: Subject<void> = new Subject<void>();
  mapReady: boolean = false;

  id = null;
  logbookData = null;
  dateValue: Date = new Date();
  dateRangeFilter: any = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fleetService: FleetService
  ) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(param => {
      this.id = param["id"];
      MapService.load().then(res => {
        this.mapReady = true;
      });
      this.loadVehicleDetails(this.dateValue);
    });

    let that = this;
    this.socket.on('message', function (data) {
      if (!that.logbookData) return;
      let vehicleData = Object.assign({}, that.logbookData);

      let updateTrip = false;
      let tripStartDate = moment(dtToTimezone(data.vehicalTripObj.JourneyStartDate, vehicleData.TimezoneRegion));
      let tripEndDate = data.vehicalTripObj.JourneyEndDate ? moment(dtToTimezone(data.vehicalTripObj.JourneyEndDate, vehicleData.TimezoneRegion)) : null;

      // check received message in date range
      if (!that.dateRangeFilter) {
        let dateValueString = that.dateValue.toDateString();
        updateTrip = (dateValueString == tripStartDate.toDate().toDateString()) ||
          (tripEndDate && dateValueString == tripEndDate.toDate().toDateString());
      }
      else {
        let momentStartDate = moment(that.dateRangeFilter.startDate);
        let momentEndDate = moment(that.dateRangeFilter.endDate);
        updateTrip = (!(tripStartDate.isBefore(momentStartDate) || tripStartDate.isAfter(momentEndDate))) ||
          (tripEndDate && !(tripEndDate.isBefore(momentStartDate) || tripEndDate.isAfter(momentEndDate)));
      }
      if (!updateTrip) return;

      // convert datetime of device message
      let deviceMsg = Object.assign({}, data.deviceMessageObj);
      if (deviceMsg.MessageReceivedUTC)
        deviceMsg.MessageReceivedUTC = dtToTimezone(deviceMsg.MessageReceivedUTC, vehicleData.TimezoneRegion);
      if (deviceMsg.UpdateTimeUTC)
        deviceMsg.UpdateTimeUTC = dtToTimezone(deviceMsg.UpdateTimeUTC, vehicleData.TimezoneRegion);

      let trip = vehicleData.VehicleTrips.find(x => x.VehicleTripId.toLowerCase() == data.vehicalTripObj.VehicleTripId.toLowerCase());
      if (trip) {
        // Update existing trip

        trip.DeviceMessages.push(deviceMsg);

        trip.DestinationPlaceId = data.vehicalTripObj.DestinationPlaceId;
        trip.DestinationPlaceName = data.vehicalTripObj.DestinationPlaceName;
        trip.DestinationGeoLocation = data.vehicalTripObj.DestinationGeoLocation;
        trip.JourneyDuration = data.vehicalTripObj.JourneyDuration;
        trip.JourneyDistance = data.vehicalTripObj.JourneyDistance;

        trip.VehicleStatus = {
          UpdateTimeUTC: data.deviceMessageObj.UpdateTimeUTC,
          Speed: deviceMsg.Speed,
          TimezoneRegion: vehicleData.TimezoneRegion
        }

        if (data.vehicalTripObj.JourneyEndDate)
          trip.JourneyEndDate = dtToTimezone(data.vehicalTripObj.JourneyEndDate, vehicleData.TimezoneRegion);
        else
          trip.Status = getStatus(trip.VehicleStatus);

        that.fleetService.setVehicleDetail(vehicleData, false);
      }
      else if (vehicleData.VehicleId.toLowerCase() == data.vehicalTripObj.VehicleId.toLowerCase()) {
        // Create new trip
        if (that.dateRangeFilter) that.loadVehicleDetails(that.dateRangeFilter.startDate, that.dateRangeFilter.endDate);
        else that.loadVehicleDetails(that.dateValue);
      }

    });

  }

  loadVehicleDetails(startDate: Date, endDate: Date = null) {
    this.fleetService.getVehicleById(this.id, startDate, endDate).takeUntil(this.ngUnsubscribe).subscribe(res => {
      this.logbookData = res;
    }, err => {
      this.router.navigate(['/user/fleet']);
    });
  }

  onDateChange(value) {
    this.dateValue = value;
    this.loadVehicleDetails(this.dateValue);
  }

  onApplyFilter(times = null) {
    this.dateRangeFilter = times;
    if (times)
      this.loadVehicleDetails(times.startDate, times.endDate);
    else
      this.loadVehicleDetails(this.dateValue);
  }

  ngOnDestroy() {
    this.fleetService.setVehicleDetail();
    this.socket.disconnect();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
