import { DatePipe } from '@angular/common';
import { map as _map } from 'lodash';
import { Subject } from 'rxjs/Subject';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FleetService } from "app/forms/user/fleet/fleet.service";
import { colors, mapOptions, getLatLng } from 'app/shared/globals';
import { PlaceService } from "app/forms/user/places/place.service";

declare var google: any;

@Component({
  selector: 'logbook-mapoverlay',
  templateUrl: './mapoverlay.Component.html'
})

export class MapkOverlayComponent implements OnInit, OnDestroy {

  ngUnsubscribe: Subject<void> = new Subject<void>();
  map: any = null;
  logbookData: any = null;
  tripList: any = [];

  allTripData: any = [];

  // change on hover of graph
  displayIcon: any = null;
  displayIconCord: any = null;
  displayTripIndex: number = null;

  isOpenTripBox: boolean = false;
  selectedTripIndex: number = null;

  mapBounds: any = null;

  stockBlue: string = '#2a7ebb';
  stockBlack: string = '#555555';

  constructor(
    private fleetService: FleetService,
    private placeService: PlaceService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    if (typeof google !== 'undefined') {
      this.loadMap();
    }
  }

  loadMap() {
    let mapProp = { center: new google.maps.LatLng(mapOptions.center), zoom: mapOptions.zoom };
    this.map = new google.maps.Map(document.getElementById('map'), mapProp);

    // subscribe to vehicle details
    this.fleetService.subscribeToVehicleDetail().takeUntil(this.ngUnsubscribe).subscribe(res => {

      this.logbookData = res ? res.data : res;
      this.allTripData = [];

      _map(this.tripList, trip => trip.setMap(null));
      this.tripList = [];
      this.mapBounds = null;

      if (this.logbookData && this.logbookData.VehicleTrips) {
        _map(this.logbookData.VehicleTrips, (v, i) => {

          let cords = [];
          _map(v.DeviceMessages, d => {
            var cord = d.CurrentGeoLocation.split(',');
            cords.push(new google.maps.LatLng(cord[0], cord[1]));
            this.allTripData.push({
              cord: new google.maps.LatLng(cord[0], cord[1]),
              time: d.UpdateTimeUTC,
              tripIndex: i
            });
          });

          if (cords.length > 0) {
            if (!this.mapBounds)
              this.mapBounds = new google.maps.LatLngBounds();

            let polyLine = new google.maps.Polyline({
              path: cords,
              strokeColor: colors[i % colors.length],
              strokeWeight: 3,
              zIndex: 1
            });

            let that = this;
            setTimeout(function () {
              var tripElement = document.getElementById(v.VehicleTripId);
              if (tripElement) {
                tripElement.addEventListener("mouseenter", function () { that.onMouseOverLine(polyLine) });
                tripElement.addEventListener("mouseleave", function () { if (!that.isOpenTripBox) that.onMouseOutLine(polyLine) });
              }
            }, 500);

            google.maps.event.addListener(polyLine, "mouseover", function () { that.onMouseOverLine(polyLine) });
            google.maps.event.addListener(polyLine, "mouseout", function () { if (!that.isOpenTripBox || that.tripList[that.selectedTripIndex] != polyLine) that.onMouseOutLine(polyLine) });
            google.maps.event.addListener(polyLine, "mouseup", function () { that.fleetService.setVehicleTrip(v) });

            this.tripList.push(polyLine);
            this.mapBounds.union(polyLine.getBounds());
          }
        });
      }

      _map(this.tripList, trip => trip.setMap(this.map));
      if (res && res.resetData && this.mapBounds) {
        this.map.fitBounds(this.mapBounds);
        this.map.panToBounds(this.mapBounds);
      }

    });

    // add marker on vehicle position
    this.fleetService.subscribeToVehiclePosition().takeUntil(this.ngUnsubscribe).subscribe(res => {
      if (res) {
        let obj = this.allTripData.find(x => {
          let time = this.datePipe.transform(x.time, 'jms');
          let resTime = this.datePipe.transform(res, 'jms');
          return time == resTime;
        });
        if (obj) {
          if (this.displayIconCord != obj.cord) {
            if (!this.displayIcon)
              this.displayIcon = new google.maps.Marker({
                position: obj.cord, map: this.map,
                icon: "assets/images/marker-vehicle-inactive.png"
              });
            else
              this.displayIcon.setPosition(obj.cord);

            this.displayIconCord = obj.cord;

            let bounds = this.map.getBounds();
            if (!bounds.contains(this.displayIcon.getPosition()))
              this.map.panTo(this.displayIcon.getPosition());

          }

          if (this.displayTripIndex != obj.tripIndex) {
            this.onMouseOverLine(this.tripList[obj.tripIndex]);
            this.displayTripIndex = obj.tripIndex;
          }

        }
      }
      else if (this.displayIcon) {
        // clear marker
        this.displayIcon.setMap(null);
        this.displayIcon = null;
        this.displayIconCord = null;
        if (!this.isOpenTripBox || this.tripList[this.displayTripIndex] != this.tripList[this.selectedTripIndex])
          this.onMouseOutLine(this.tripList[this.displayTripIndex]);
        this.displayTripIndex = null;
      }
    });


    let startMarker = null;
    let endMarker = null;
    let subscribeCount = 0;
    // add marker to start and end points of trip
    this.fleetService.subscribeToVehicleTrip().takeUntil(this.ngUnsubscribe).subscribe(res => {

      subscribeCount += 1;
      this.isOpenTripBox = res ? true : false;
      this.tripList.map(polyLine => this.onMouseOutLine(polyLine));

      if (res && res.DeviceMessages && res.DeviceMessages.length > 0) {
        var startCord = res.DeviceMessages[0].CurrentGeoLocation.split(',');
        var endCord = res.DeviceMessages[res.DeviceMessages.length - 1].CurrentGeoLocation.split(',');

        if (startMarker)
          startMarker.setMap(null);
        if (endMarker)
          endMarker.setMap(null);

        startMarker = new google.maps.Marker({
          position: new google.maps.LatLng(startCord[0], startCord[1]),
          map: this.map,
          icon: {
            url: "assets/images/marker-trip-point-start.png",
            labelOrigin: new google.maps.Point(18, 18)
          },
          label: "A"
        });

        endMarker = new google.maps.Marker({
          position: new google.maps.LatLng(endCord[0], endCord[1]),
          map: this.map,
          icon: {
            url: "assets/images/marker-trip-point-end.png",
            labelOrigin: new google.maps.Point(18, 18)
          },
          label: "B"
        });

        let obj = this.allTripData.find(x => {
          let time = this.datePipe.transform(x.time, 'jms');
          let resTime = this.datePipe.transform(res.DeviceMessages[0].UpdateTimeUTC, 'jms');
          return time == resTime;
        });
        this.selectedTripIndex = obj.tripIndex;
        if (obj) {
          if (subscribeCount != 1) {
            let that = this;
            setTimeout(function () {
              let polyLine = that.tripList[obj.tripIndex];
              that.onMouseOverLine(polyLine);
              that.map.fitBounds(polyLine.getBounds());
              that.map.panToBounds(polyLine.getBounds());
            }, 200);
          }
          else {
            let polyLine = this.tripList[obj.tripIndex];
            this.onMouseOverLine(polyLine);
            this.map.fitBounds(polyLine.getBounds());
            this.map.panToBounds(polyLine.getBounds());
          }
        }
        else if (this.mapBounds) {
          this.map.fitBounds(this.mapBounds);
          this.map.panToBounds(this.mapBounds);
        }
      }
      else {
        subscribeCount = 0;
        this.selectedTripIndex = null;
        if (startMarker)
          startMarker.setMap(null);
        if (endMarker)
          endMarker.setMap(null);
        if (this.mapBounds) {
          this.map.fitBounds(this.mapBounds);
          this.map.panToBounds(this.mapBounds);
        }

      }
    });

    // add places to map
    this.placeService.getAllPlaces().takeUntil(this.ngUnsubscribe).subscribe(res => {
      let places = res.Result;
      if (places) {
        places.map(place => {
          var shape = null;
          if (place.HasCircularGeofence) {
            shape = new google.maps.Circle({
              strokeColor: this.stockBlack,
              center: getLatLng(place.CenterCoordinate),
              radius: Math.sqrt(place.SquareMeterArea / Math.PI)
            });
          }
          else {
            let coordinates = place.GeofenceCoordinates ? JSON.parse(place.GeofenceCoordinates) : [];
            shape = new google.maps.Polygon({
              strokeColor: this.stockBlack,
              paths: coordinates
            });
          }

          shape.infoWindow = new google.maps.InfoWindow({ content: `<b>${place.Name}</b>` });
          shape.infoWindow.setPosition(getLatLng(place.CenterCoordinate));

          let that = this;
          google.maps.event.addListener(shape, "mouseover", function () {
            shape.setOptions({ strokeColor: that.stockBlue, fillColor: that.stockBlue });
            shape.infoWindow.open(that.map, shape);
          });
          google.maps.event.addListener(shape, "mouseout", function () {
            shape.setOptions({ strokeColor: that.stockBlack, fillColor: that.stockBlack });
            shape.infoWindow.close();
          });

          shape.setMap(this.map);
        });

      }

    });

  }

  onMouseOverLine(polyLine) {
    if (polyLine)
      polyLine.setOptions({ strokeWeight: 6, zIndex: 99 });
  }

  onMouseOutLine(polyLine) {
    if (polyLine)
      polyLine.setOptions({ strokeWeight: 3, zIndex: 1 });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
