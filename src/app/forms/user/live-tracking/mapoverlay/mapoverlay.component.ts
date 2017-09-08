import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Subscription } from 'rxjs/Subscription';

import * as io from "socket.io-client";

import { colors, mapOptions, getStatus, activityStatus } from 'app/shared/globals';
import { LiveTrackingService } from "app/forms/user/live-tracking/live-tracking.service";
import { CommonService } from "app/services/common.service";
import { includes as _includes } from "lodash";
import { environment } from "environments/environment";
import { StatusDetailModel, ActivityStatusModel } from "app/model/Common";
import { ScriptService } from "app/services/scripts.service";

declare var google: any;
declare var MarkerClusterer: any;
declare var InfoBox: any;

@Component({
  selector: 'livetracking-mapoverlay',
  templateUrl: './mapoverlay.component.html'
})
export class MapoverlayComponent implements OnInit, OnDestroy {

  private iconBasePath: string = "assets/images/";
  private subscriptions: Subscription[] = [];
  private allLiveVehicles: any;
  private filteredLiveVehicles: any;
  private authUserObj: any;
  private map: any = null;
  private filterGroupIds: Array<string> = [];
  private filterVehicleIds: Array<string> = [];
  private movingVehicleIds: Array<string> = [];
  private markerCluster: any;
  socket = io.connect(environment.socketURL);
  private allMarkers: any = {};
  private markerBoxStyle: any = {
    border: "none",
    textAlign: "center",
    fontSize: "8pt",
    fontWeight: "bold",
    color: "#FFFFFF",
    borderRadius: "3px",
    padding: "7px",
    background: "#000",
    opacity: '0.7'
  }

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _liveTrackingService: LiveTrackingService, private commonService: CommonService,
    private _scriptService: ScriptService) {
    this.authUserObj = this.commonService.AuthUser.getValue();
  }

  ngOnInit() {
    // load tracking cord if param available
    let centerCord = mapOptions.center;
    this._activatedRoute.params.subscribe(param => {
      let cords = param["trackingCord"];
      if (cords && _includes(cords, ',')) {
        let cord = cords.split(',');
        centerCord = { lat: parseFloat(cord[0]), lng: parseFloat(cord[1]) };
      }
    });

    if (typeof google !== 'undefined') {
      this.loadMap(centerCord);
    }
    this._scriptService.load('infoBox').then(res => {
      this.getMarkers();
    })

    this._liveTrackingService.followGroup.subscribe((groupId: string) => {
      if (!this.filterGroupIds.includes(groupId)) {
        this.filterGroupIds.push(groupId);
        this.allLiveVehicles.filter((item) => {
          if (item.ClientGroupId == groupId && this.filterVehicleIds.includes(item.VehicleId)) {
            this.filterVehicleIds.splice(this.filterVehicleIds.indexOf(item.VehicleId), 1);
          }
        });
      }
      else {
        this.filterGroupIds.splice(this.filterGroupIds.indexOf(groupId), 1);
      }
    });

    this._liveTrackingService.followVehicle.subscribe((vehicleIds: Array<string>) => {
      vehicleIds.forEach(vId => {
        if (this.filterVehicleIds.includes(vId))
          this.filterVehicleIds.splice(this.filterVehicleIds.indexOf(vId), 1);
        else
          this.filterVehicleIds.push(vId);
      });

      if (this.filterVehicleIds.length > 0) {
        this.filteredLiveVehicles = this.allLiveVehicles.filter((item) => {
          return this.filterVehicleIds.includes(item.VehicleId);
        });
        this.plotMarker(this.filteredLiveVehicles);
      }
      else
        this.plotMarker(this.allLiveVehicles);
    });

    this._liveTrackingService.topSwitchChange.subscribe(val => {
      this.filterVehicleIds = [];
      this.filterGroupIds = [];
      if (val)
        this.plotMarker(this.allLiveVehicles);
      else
        this.plotMarker([]);
    });

    this.socket.on('message', function (data) {
      let updateVehicle = this.filteredLiveVehicles.filter(vehicle => {
        return vehicle.VehicleId.toLowerCase() == data.deviceMessageObj.VehicleId.toLowerCase();
      })[0];
      if (updateVehicle) {
        updateVehicle.CurrentGeoLocation = data.deviceMessageObj.CurrentGeoLocation;
        updateVehicle.DeviceMessageId = data.deviceMessageObj.DeviceMessageId;
        updateVehicle.MessageReceivedDate = data.deviceMessageObj.MessageReceivedUTC;
      }
      this.markerCluster.removeMarker(this.allMarkers[data.deviceMessageObj.VehicleId.toLowerCase()]);

      let statusDetailModel: StatusDetailModel = {
        UpdateTimeUTC: data.deviceMessageObj.UpdateTimeUTC,
        Speed: data.deviceMessageObj.Speed,
        TimezoneRegion: updateVehicle.TimezoneRegion
      }
      let status: any = getStatus(statusDetailModel);
      updateVehicle.status = status;
      if (status.Status == activityStatus.Moving.Status) {
        if (!this.movingVehicleIds.includes(updateVehicle.VehicleId))
          this.movingVehicleIds.push(updateVehicle.VehicleId);
      }
      else if (this.movingVehicleIds.includes(updateVehicle.VehicleId)) {
        this.movingVehicleIds.splice(this.filterVehicleIds.indexOf(updateVehicle.VehicleId), 1);
      }
      this._liveTrackingService.setMovingVehicles(this.movingVehicleIds.length);

      let marker = this.getMarkerObj(updateVehicle);
      this.markerCluster.addMarker(marker);
      this.allMarkers[data.deviceMessageObj.VehicleId.toLowerCase()] = marker;
    }.bind(this));
  }

  loadMap(centerCord) {
    let mapProp = {
      center: new google.maps.LatLng(centerCord),
      zoom: mapOptions.zoom
    };
    this.map = new google.maps.Map(document.getElementById('map'), mapProp);
  }

  getMarkers() {
    this.subscriptions.push(this._liveTrackingService.getLiveVehicles(this.authUserObj.ClientId).subscribe(liveVehicles => {
      liveVehicles.Result.forEach(element => {
        let statusDetailModel: StatusDetailModel = {
          UpdateTimeUTC: element.MessageReceivedDate,
          Speed: element.Speed,
          TimezoneRegion: element.TimezoneRegion
        }
        element.status = getStatus(statusDetailModel);
        if (element.status.Status == activityStatus.Moving.Status)
          this.movingVehicleIds.push(element.VehicleId);
      });
      this._liveTrackingService.setMovingVehicles(this.movingVehicleIds.length);
      this.allLiveVehicles = this.filteredLiveVehicles = liveVehicles.Result;
      this.plotMarker(this.allLiveVehicles);
    }));
  }

  plotMarker(vehicles) {
    var bounds = new google.maps.LatLngBounds();

    if (this.markerCluster) { this.markerCluster.clearMarkers(); }
    let _this = this;
    var markers = vehicles.map(function (item, i) {
      let marker: any = _this.getMarkerObj(item);
      bounds.extend(marker.position);
      _this.allMarkers[item.VehicleId] = marker;
      return marker;
    });
    if (markers.length > 0)
      this.map.fitBounds(bounds);

    if (this.map.getZoom() > 11) {
      this.map.setZoom(11);
    }

    this.markerCluster = new MarkerClusterer(this.map, markers,
      { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
  }

  getMarkerObj(item) {
    let latLng = item.CurrentGeoLocation.split(',');
    let myOptions = {
      content: item.VehicleName,
      boxStyle: this.markerBoxStyle,
      pixelOffset: new google.maps.Size(25, -35),
      position: new google.maps.LatLng(latLng[0], latLng[1]),
      closeBoxURL: "",
      pane: "mapPane"
    };
    let ibLabel = new InfoBox(myOptions);
    let marker = new google.maps.Marker({
      position: new google.maps.LatLng(latLng[0], latLng[1]),
      icon: `assets/images/${item.status.Key}/${item.MapIconPath}`
    });

    marker.bindTo('map', ibLabel);
    marker.bindTo('position', ibLabel);
    return marker;
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }
}
