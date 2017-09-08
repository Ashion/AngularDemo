
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import * as io from "socket.io-client";

import { VisTimelineItems, VisTimeline, VisTimelineGroups, VisTimelineService } from 'ng2-vis';

import { TrackingLogService } from '../tracking-log.service';
import { BindingService } from "app/services/binding.service";
import { CommonService } from "app/services/common.service";
import { Router } from '@angular/router';
import { SecondToTimePipe } from "app/shared/utility.pipe";
import { environment } from "environments/environment";


@Component({
  selector: 'timeline-bar',
  templateUrl: './timeline-bar.component.html',
  providers: [SecondToTimePipe]
})

export class TimelineBarComponent implements OnInit, OnDestroy {
  private authUserObj: any;
  private openGroupPopup: Boolean = false;
  private dateValue: Date = new Date();
  private displayClear: boolean = false;
  private selectedTrip: any;

  socket = io.connect(environment.socketURL);

  private subscriptions: Subscription[] = [];
  private visTimeline: string = 'tl';
  private allVehicles: any = [];
  private vehicleSerach: string = '';
  private currentTrips: any = [];
  clientGropus: any = [];
  private visTimelineItems: VisTimelineItems;
  private visTimelineGroups: VisTimelineGroups;
  private visTimelineOptions: any = {
    min: new Date().setHours(0, 0, 0, 0),
    max: new Date().setHours(23, 59, 59, 999),
    start: new Date().setHours(0, 0, 0, 0),
    end: new Date().setHours(12, 0, 0, 0),
    orientation: 'top',
    autoResize: true,
    showMajorLabels: false,
    zoomMax: 24 * 60 * 60 * 1000,
    zoomMin: 60 * 60 * 1000,
    showCurrentTime: true,
    format: {
      minorLabels: {
        hour: 'hh:mm A',
      }
    },
    verticalScroll: true,
    zoomKey: 'ctrlKey',
    height: '60vh'
  }

  constructor(
    private _router: Router,
    private _trackingService: TrackingLogService, private _timelineService: VisTimelineService,
    private _bindingService: BindingService, private commonService: CommonService,
    private _secondToTimePipe: SecondToTimePipe) {
    this.authUserObj = this.commonService.AuthUser.getValue();
  }

  public timelineInitialized(): void {
    this._timelineService.on(this.visTimeline, 'click');

    // open your console/dev tools to see the click params
    this._timelineService.click.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visTimeline) {
        var popups: any = document.getElementsByClassName("itemPOPUP");
        for (var i = 0; i < popups.length; i++) {
          popups[i].style.visibility = "hidden";
        }
        if (eventData[1].what == "group-label") {
          this._router.navigate(['/user/fleet/logbook/' + eventData[1].group]);
        }
        if (eventData[1].item) {
          document.getElementById("divToRender" + eventData[1].item).style.visibility = "visible";
          this.selectedTrip = this.currentTrips.filter((trip) => {
            return trip.VehicleTripId == eventData[1].item;
          })[0];
        }
      }
    });
  }

  ngOnInit() {
    this.subscriptions.push(this._trackingService.getVehicleList().subscribe(vehicles => {
      this.allVehicles = vehicles.Result;
      this.renderGroups(this.allVehicles);
    }));
    this.visTimelineItems = new VisTimelineItems([]);

    this.subscriptions.push(this._bindingService.getClientGroup(this.authUserObj.ClientId).subscribe(clientGroups => {
      this.clientGropus = clientGroups.Result;
    }));
    this.onDateChange(this.dateValue);

    this.socket.on('message', function (data) {
      let tripElement = this.currentTrips.filter(element => {
        return element.VehicleTripId == data.vehicalTripObj.VehicleTripId.toLowerCase();
      })[0];
      if (tripElement) {
        let timelineItem = this.visTimelineItems.filter(element => {
          return element.id == tripElement.VehicleTripId;
        })[0];
        if (timelineItem) {
          timelineItem = this.getTimelineItem(tripElement);
        }
      }
    }.bind(this));
  }

  searchVehicle() {
    this.displayClear = this.vehicleSerach.length > 0;
    let vehicleFilter = this.allVehicles.filter((vehicle) => {
      return vehicle.VehicleName.toLowerCase().indexOf(this.vehicleSerach) != -1;
    });
    this.renderGroups(vehicleFilter);
  }

  filterGroup(id) {
    this.displayClear = true;
    let vehicleFilter = this.allVehicles.filter((vehicle) => {
      return vehicle.GroupId == id;
    });
    this.openGroupPopup = false;
    this.renderGroups(vehicleFilter);
  }

  clearFilter() {
    this.displayClear = false;
    this.vehicleSerach = '';
    this.searchVehicle();
  }

  renderGroups(vehicles) {
    let groups = [];
    vehicles.forEach(element => {
      groups.push({
        id: element.VehicleId,
        content: `  
                    <div class="log-search-res-box full-width">
                      <div class="log-user-img">
                        <img src="${element.PhotoURL || 'assets/images/user-icon.png'}" title="${element.DriverName}" alt="driver-image" />
                      </div>
                      <b> ${element.VehicleName}</b>
                      <span>${element.DriverName}</span>
                    </div>`
      })
    });
    this.visTimelineGroups = new VisTimelineGroups(groups);
  }

  getTimelineItem(tripElement) {
    let duration = this._secondToTimePipe.transform(tripElement.JourneyDuration);
    return {
      id: tripElement.VehicleTripId,
      content: `<div><b>${tripElement.JourneyDistance || 0} km</b></div>
                <div>${duration}</div>
                <div>
                  <div id="divToRender${tripElement.VehicleTripId}" class="itemPOPUP" style="position:fixed; z-index:100;visibility: hidden;">
                  <div class="journey-sec journey-box">
                    <div class="row">
                      <div class="journey-box-sub top">	
                        <ul>
                          <li>
                            <span class="title">Distance</span>
                            <span class="detail">${tripElement.JourneyDistance || 0} km</span>
                          </li>
                          <li>
                            <span class="title">Duration</span>
                            <span class="detail">${duration} </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div class="journey-box-sub">
                      <div class="st-title">Start <b class="pull-right">${new Date(tripElement.JourneyStartDate).toLocaleString()}</b></div>
                      <div class="place"><i aria-hidden="true" class="fa fa-map-marker"></i>
                        22 Rose St, Croydon Park NSW 2133, Australia 62,706.8 km
                      </div>
                      <div class="km">0 km</div>
                    </div>
                  <div class="journey-box-sub end">
                    <div class="st-title">End <b class="pull-right">${tripElement.JourneyEndDate ? new Date(tripElement.JourneyEndDate).toLocaleString() : this.addHours(tripElement.JourneyStartDate, 3).toLocaleString()}</b></div>
                    <div class="place"><i aria-hidden="true" class="fa fa-map-marker"></i>
                      22 Rose St, Croydon Park NSW 2133, Australia 62,706.8 km
                    </div>
                    <div class="km">0 km</div>
                  </div>
                </div>
                `,
      start: tripElement.JourneyStartDate,
      end: tripElement.JourneyEndDate,
      group: tripElement.VehicleId,
      className: tripElement.JourneyEndDate ? 'yellow' : 'green'
    }
  }

  onDateChange(value: Date) {
    this.dateValue = value;
    this.subscriptions.push(this._trackingService.getVehicleTripList(value).subscribe(trips => {
      this.currentTrips = trips.Result;
      let tripsArr = [];
      trips.Result.forEach(element => {
        tripsArr.push(this.getTimelineItem(element));
      });
      this.visTimelineItems = new VisTimelineItems(tripsArr);
      this.setTimelineRange();
    }));
  }

  prevDate() {
    var d = new Date(this.dateValue);
    d.setDate(d.getDate() - 1);
    this.dateValue = d;
    this.onDateChange(this.dateValue);
    this.setTimelineRange();
  }

  nextDate() {
    var d = new Date(this.dateValue);
    d.setDate(d.getDate() + 1);
    this.dateValue = d;
    this.onDateChange(this.dateValue);
    this.setTimelineRange();
  }

  setTimelineRange() {
    this.visTimelineOptions.start = new Date(this.dateValue).setHours(0, 0, 0, 0);
    this.visTimelineOptions.end = new Date(this.dateValue).setHours(12, 0, 0, 0);
    this.visTimelineOptions.min = new Date(this.dateValue).setHours(0, 0, 0, 0);
    this.visTimelineOptions.max = new Date(this.dateValue).setHours(23, 59, 59, 999);
    this._timelineService.setOptions(this.visTimeline, this.visTimelineOptions);
  }

  zoomIn() {
    this.zoom(-0.1);
  }

  zoomOut() {
    this.zoom(0.1);
  }

  zoom(percentage) {
    var range: any = this._timelineService.getWindow(this.visTimeline);
    var interval = range.end - range.start;
    this._timelineService.setWindow(this.visTimeline,
      range.start.valueOf() - interval * percentage,
      range.end.valueOf() + interval * percentage);
  }

  addHours(date, h) {
    let startDate = new Date(date);
    startDate.setHours(startDate.getHours() + h);
    return startDate;
  }

  public ngOnDestroy(): void {
    this._timelineService.off(this.visTimeline, 'click');
    this.subscriptions.forEach(s => s.unsubscribe());
    this.socket.disconnect();
  }
}

