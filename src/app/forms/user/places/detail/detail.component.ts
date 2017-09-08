import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PanelBarExpandMode } from '@progress/kendo-angular-layout';
import { PlaceModel } from 'app/model/Place';
import { MapService } from 'app/services/map.service';
import { NotifyService } from 'app/services/notification.service';
import { valDuplicateInputStyle, isUUID, calcBounds, getLatLng } from 'app/shared/globals';
import { DigitDecimalPipe } from 'app/shared/utility.pipe';
import { PlaceService } from '../place.service';
import { BehaviorSubject } from "rxjs/BehaviorSubject";

declare var google: any;

@Component({
  selector: 'places-detail',
  templateUrl: './detail.component.html',
  providers: [DigitDecimalPipe]
})

export class DetailComponent implements OnInit, OnDestroy {

  placeModel: PlaceModel = new PlaceModel();
  mapReady: boolean = false;

  _valDuplicateInputStyle = valDuplicateInputStyle;

  handMode: any;
  circleMode: any;
  polygonMode: any;

  mode: any = PanelBarExpandMode.Single;
  drawType: string = '';
  isDrawPolygon: boolean = false;
  isDrawPlace: boolean = false;

  loadingPlace: boolean = false;
  isDuplicatePlace: boolean = null;
  loadingSave: boolean = false;
  isInvalidRadius: boolean = false;

  loadingTrips: BehaviorSubject<boolean> = new BehaviorSubject(false);
  vehicleTrips: Array<any> = [];
  deviceMessages: Array<any> = [];

  IncludeTrips: boolean = true;
  IncludePassingThrough: boolean = true;

  placeId: string = "";
  suggestion: string = "";

  constructor(
    private zone: NgZone,
    private router: Router,
    private placeService: PlaceService,
    private digitDecimalPipe: DigitDecimalPipe,
    private notifyService: NotifyService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe(param => {
      let value = param["placeId"];
      if (value == 'new') this.placeId = value;
      else if (isUUID(value)) this.placeId = value;
      else if (value == 'suggestion' && localStorage.getItem("suggestionName")) { this.suggestion = localStorage.getItem("suggestionName"); }
      else this.router.navigate(['user/places']);
    });
  }

  ngOnInit() {
    this.fetchVehicleTrips(this.placeId);
    this.placeModel.HasCircularGeofence = true;
    MapService.load().then(res => {
      this.mapReady = true;
      this.initDrawingManager();

      if (this.placeId && this.placeId != 'new') {
        this.placeService.loadPlaceById(this.placeId).subscribe(res => { }, err => { this.router.navigate(['/user/places']); });
        this.placeService.subscribeToPlaceDetail().subscribe(place => {
          if (!place)
            return;

          this.placeModel.PlaceId = place.PlaceId;
          this.placeModel.ClientId = place.ClientId;
          this.placeModel.Name = place.Name;
          this.placeModel.SquareMeterArea = place.SquareMeterArea;
          this.placeModel.HasCircularGeofence = place.HasCircularGeofence;
          this.placeModel.GeofenceCoordinates = place.GeofenceCoordinates;
          this.placeModel.CenterCoordinate = place.CenterCoordinate;
          this.placeModel.Radius = place.HasCircularGeofence ? Math.sqrt(place.SquareMeterArea / Math.PI) : 0;

          if (place.HasCircularGeofence) {
            this.setDrawMode(this.handMode);
            this.isDrawPolygon = false;
            this.isDrawPlace = false;
          }
        })
      }
      else if (this.suggestion) {
        // handle suggestion for create place
        let geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': this.suggestion }, function (results, status) {
          if (status === 'OK') {
            var bounds = calcBounds(results[0].geometry.location, new google.maps.Size(200, 200));
            var NE = bounds.getNorthEast();
            var SW = bounds.getSouthWest();
            var NW = new google.maps.LatLng(NE.lat(), SW.lng());
            var SE = new google.maps.LatLng(SW.lat(), NE.lng());

            let shape = new google.maps.Polygon({ paths: [NE, NW, SW, SE] });
            let cords = [];
            let polygonPath = shape.getPath();
            for (var i = 0; i < polygonPath.getLength(); i++) {
              let cord = polygonPath.getAt(i);
              cords.push({ lat: cord.lat(), lng: cord.lng() });
            }

            this.placeModel.CenterCoordinate = results[0].geometry.location.lat() + "," + results[0].geometry.location.lng();
            this.placeModel.GeofenceCoordinates = JSON.stringify(cords);
            this.placeModel.SquareMeterArea = this.digitDecimalPipe.transform(google.maps.geometry.spherical.computeArea(polygonPath), 4);
            this.placeModel.HasCircularGeofence = false
            this.placeModel.Radius = 0;

            this.placeService.setPlaceDetail(this.placeModel);
            this.zone.run(() => this.isDrawPlace = true);
          }
          else this.router.navigate(['/user/places']);
        }.bind(this));
      }
      else {
        this.placeModel.HasCircularGeofence = true;
        this.setDrawMode(this.circleMode);
      }
    });
  }

  // fetch vehicle trips / devicemessages
  fetchVehicleTrips(placeId: string) {
    this.loadingTrips.next(true);
    this.placeService.getVehicleTrips(placeId).subscribe(responseTrips => {
      if (responseTrips) {
        this.vehicleTrips = responseTrips.Result.VehicleTrips || [];
        this.deviceMessages = responseTrips.Result.DeviceMessages || [];
      }
      this.loadingTrips.next(false);
    }, err => this.loadingTrips.next(false));
  }

  initDrawingManager() {
    this.handMode = null;
    this.circleMode = google.maps.drawing.OverlayType.CIRCLE;
    this.polygonMode = google.maps.drawing.OverlayType.POLYGON;
  }

  // on selection of draw type (Circular/Polygon)
  changeDrawType(drawPolygon = this.isDrawPolygon) {
    this.isDrawPolygon = drawPolygon;
    if (this.isDrawPolygon) {
      this.placeModel.HasCircularGeofence = false;
      this.setDrawMode(this.polygonMode);
    }
    else {
      this.placeModel.HasCircularGeofence = true;
      this.setDrawMode(this.circleMode);
    }
  }

  // set draw mode to map
  setDrawMode(mode) {
    this.drawType = mode;
    this.placeService.setDrawingMode(mode);
  }

  // set draw place to true
  drawPlace(e) {
    let overlay = e.overlay;
    let isPolygon = this.isDrawPolygon = e.type == 'polygon';
    this.setDrawMode(this.handMode);

    if (isPolygon) {
      // get array of coordinates
      let cords = [];
      let polygonPath = overlay.getPath();
      for (var i = 0; i < polygonPath.getLength(); i++) {
        let cord = polygonPath.getAt(i);
        cords.push({ lat: cord.lat(), lng: cord.lng() });
      }

      // get center coordinate
      var bounds = new google.maps.LatLngBounds();
      overlay.getPath().forEach(function (element, index) { bounds.extend(element); });
      let centerCord = bounds.getCenter();

      this.placeModel.CenterCoordinate = centerCord.lat() + "," + centerCord.lng();
      this.placeModel.GeofenceCoordinates = JSON.stringify(cords);
      this.placeModel.SquareMeterArea = this.digitDecimalPipe.transform(google.maps.geometry.spherical.computeArea(overlay.getPath()), 4);
      this.placeModel.Radius = 0;
    }
    else {
      let centerCord = overlay.getCenter();

      this.placeModel.CenterCoordinate = centerCord.lat() + "," + centerCord.lng();
      this.placeModel.GeofenceCoordinates = null;
      let radius = overlay.getRadius();
      this.placeModel.SquareMeterArea = this.digitDecimalPipe.transform((radius * radius * Math.PI), 4);
      this.placeModel.Radius = radius;
    }
    this.zone.run(() => this.isDrawPlace = true);
  }

  // change radius of circle
  changeRadius(event: Event) {
    if (!this.isDrawPolygon) {
      let value = (<HTMLInputElement>event.target).value;
      let radius = value ? parseFloat(value) : 0;

      if (value == '') {
        this.isInvalidRadius = false;
        return;
      } else if (radius == 0) {
        this.isInvalidRadius = true;
        return;
      }
      this.isInvalidRadius = false;
      this.placeService.setCircleRadius(radius); // Math.sqrt(value / Math.PI)
      this.placeModel.SquareMeterArea = Math.PI * radius * radius;
    }
  }

  // reset place area for redraw
  resetPlace() {
    this.zone.run(() => {
      this.isInvalidRadius = false;
      this.isDrawPlace = false;
      this.changeDrawType();
    });
  }

  // on change event of place 
  placeChange(event: Event) {
    let text = (<HTMLInputElement>event.target).value;
    if (text != '') {
      this.loadingPlace = true;
      this.placeService.checkDuplicate(text, this.suggestion ? 'new' : this.placeId).subscribe(res => {
        this.isDuplicatePlace = res.Result
        this.loadingPlace = false;
      }, err => {
        this.loadingPlace = false;
      });
    }
    else {
      this.isDuplicatePlace = null;
      this.loadingPlace = false;
    }
  }

  // add place
  addPlace() {
    if (this.isDuplicatePlace) {
      this.notifyService.error('Place Name is already exist.');
      return;
    }

    this.loadingSave = true;
    this.loadingTrips.subscribe(res => {
      if (!res) {
        // check cords of vehicle trip & device message
        if (this.IncludeTrips || this.IncludePassingThrough) {

          if (!this.IncludeTrips) this.vehicleTrips = [];
          if (!this.IncludePassingThrough) this.deviceMessages = [];

          let shape = null;
          if (this.placeModel.HasCircularGeofence) {
            shape = new google.maps.Circle({
              center: getLatLng(this.placeModel.CenterCoordinate),
              radius: Math.sqrt(this.placeModel.SquareMeterArea / Math.PI)
            });
          }
          else {
            shape = new google.maps.Polygon({
              paths: JSON.parse(this.placeModel.GeofenceCoordinates)
            });
          }

          let vehicleFromTripList = [];
          let vehicleDestinationTripList = [];
          let deviceMessageList = [];

          if (this.placeModel.HasCircularGeofence) {
            this.vehicleTrips.map(trip => {
              if ((!trip.FromPlaceId || trip.FromPlaceId == this.placeId) && google.maps.geometry.spherical.computeDistanceBetween(shape.getCenter(), getLatLng(trip.FromGeoLocation)) <= shape.getRadius())
                vehicleFromTripList.push(trip.VehicleTripId);
              if ((!trip.DestinationPlaceId || trip.DestinationPlaceId == this.placeId) && google.maps.geometry.spherical.computeDistanceBetween(shape.getCenter(), getLatLng(trip.DestinationGeoLocation)) <= shape.getRadius())
                vehicleDestinationTripList.push(trip.VehicleTripId);
            });
            this.deviceMessages.map(trip => {
              if (google.maps.geometry.spherical.computeDistanceBetween(shape.getCenter(), getLatLng(trip.CurrentGeoLocation)) <= shape.getRadius())
                deviceMessageList.push(trip.DeviceMessageId);
            });
          }
          else {
            this.vehicleTrips.map(trip => {
              if (!trip.FromPlaceId && google.maps.geometry.poly.containsLocation(getLatLng(trip.FromGeoLocation), shape))
                vehicleFromTripList.push(trip.VehicleTripId);
              if (!trip.DestinationPlaceId && google.maps.geometry.poly.containsLocation(getLatLng(trip.DestinationGeoLocation), shape))
                vehicleDestinationTripList.push(trip.VehicleTripId);
            });
            this.deviceMessages.map(trip => {
              if (google.maps.geometry.poly.containsLocation(getLatLng(trip.CurrentGeoLocation), shape))
                deviceMessageList.push(trip.DeviceMessageId);
            });
          }

          this.placeModel.VehicleFromTripList = vehicleFromTripList;
          this.placeModel.VehicleDestinationTripList = vehicleDestinationTripList;
          this.placeModel.DeviceMessageList = deviceMessageList;
        }

        // save place with vehicle trip / device messages cords
        this.placeService.save(this.placeModel).subscribe(response => {
          this.loadingSave = false;
          this.notifyService.success(this.placeModel.PlaceId ? "Place updated successfully." : "Place created successfully.");
          if (this.suggestion)
            localStorage.removeItem("suggestionName");
          this.router.navigate(['/user/places']);
        }, err => this.loadingSave = false);

      }
    });

  }

  backToPlaces() {
    if (this.suggestion)
      localStorage.removeItem("suggestionName");
    this.router.navigate(['/user/places']);
  }

  ngOnDestroy() {
    if (this.suggestion)
      localStorage.removeItem("suggestionName");
  }

}
