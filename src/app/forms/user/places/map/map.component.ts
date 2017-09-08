import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { includes as _includes, map as _map } from "lodash";

import { Subject } from 'rxjs/Subject';
import "rxjs/add/operator/takeUntil";

import { PlaceService } from '../place.service';
import { NotifyService } from "app/services/notification.service";
import { mapOptions, getLatLng, calcBounds } from "app/shared/globals";

declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html'
})

export class MapComponent implements OnInit, OnDestroy {

  // declare var for Add/Edit place
  @Input() detailPlace: boolean = false;
  @Input() placeId: string = "";
  @Output() drawPlaceArea = new EventEmitter();
  @Output() resetPlaceArea = new EventEmitter();

  ngUnsubscribe: Subject<void> = new Subject<void>();

  map: any = null;
  drawingManager: any = null;
  placeArea: any = null;
  addListener: boolean = false;

  // declare var for display/delete places
  placesArr: Array<any> = [];
  displayBounds: any = null;

  suggestionsArr: Array<any> = [];
  suggestionsBounds: any = null;

  infoWindows: Array<any> = [];

  stockBlue: string = '#2a7ebb';
  stockBlack: string = '#555555';
  stockBlackSuggestions: string = '#000000';

  constructor(
    private placeService: PlaceService,
    private notifyService: NotifyService
  ) { }

  ngOnInit() {
    if (typeof google !== 'undefined') {
      this.loadMap();
    }
  }

  loadMap() {
    let mapProp = { center: new google.maps.LatLng(mapOptions.center), zoom: mapOptions.zoom };
    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    if (this.detailPlace) {
      // Create/Update Place
      this.drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        circleOptions: { editable: true },
        polygonOptions: { editable: true }
      });

      if (this.placeId == 'new') {
        // Create Place
        this.placeService.getDrawingMode().takeUntil(this.ngUnsubscribe).subscribe(obj => {
          if (obj && obj.drawingMode) {
            this.drawingManager.setDrawingMode(obj.drawingMode);
            this.drawingManager.setMap(this.map);

            if (this.drawingManager.drawingMode && !this.addListener) {
              google.maps.event.addListener(this.drawingManager, 'overlaycomplete', function (e) {
                this.placeArea = e.overlay;
                this.drawingManager.setDrawingMode(null);
                this.onClickPlaceArea(e);
              }.bind(this));
              this.onEscKeyUp();
            }
          }
        });
        this.addListener = true;
      }
      else {
        // Update Place
        this.placeService.subscribeToPlaceDetail().takeUntil(this.ngUnsubscribe).subscribe(place => {
          if (!place)
            return;

          let e = null;
          if (place.HasCircularGeofence) {
            this.placeArea = new google.maps.Circle({
              map: this.map,
              editable: true,
              center: getLatLng(place.CenterCoordinate),
              radius: Math.sqrt(place.SquareMeterArea / Math.PI)
            });
            e = { type: "circle", overlay: this.placeArea };
          }
          else {
            let coordinates = place.GeofenceCoordinates ? JSON.parse(place.GeofenceCoordinates) : [];
            this.placeArea = new google.maps.Polygon({
              map: this.map,
              editable: true,
              paths: coordinates
            });
            e = { type: "polygon", overlay: this.placeArea };
          }
          if (e)
            this.fitBoundToMap(e);

          this.placeService.getDrawingMode().takeUntil(this.ngUnsubscribe).subscribe(drawingObj => {
            if (drawingObj && drawingObj.drawingMode) {
              this.drawingManager.setDrawingMode(drawingObj.drawingMode);
              this.drawingManager.setMap(this.map);

              if (this.drawingManager.drawingMode && !this.addListener) {
                google.maps.event.addListener(this.drawingManager, 'overlaycomplete', function (e) {
                  this.placeArea = e.overlay;
                  this.drawingManager.setDrawingMode(null);
                  this.onClickPlaceArea(e);
                }.bind(this));
                this.addListener = true;
              }
            }
          });
          this.onClickPlaceArea(e);
          this.onEscKeyUp();
        });
      }
    }
    else {
      // Display Places
      this.placeService.subscribeToPlaces().takeUntil(this.ngUnsubscribe).subscribe(places => {
        if (places) {
          // reset all shape
          this.placesArr.map(place => {
            place.shape.setMap(null);
          });

          let bounds = new google.maps.LatLngBounds();
          places.map(place => {
            var shape = null;
            if (place.HasCircularGeofence) {
              shape = new google.maps.Circle({
                strokeColor: this.stockBlack,
                center: getLatLng(place.CenterCoordinate),
                radius: Math.sqrt(place.SquareMeterArea / Math.PI)
              });
              bounds.union(shape.getBounds());
            }
            else {
              let coordinates = place.GeofenceCoordinates ? JSON.parse(place.GeofenceCoordinates) : [];
              shape = new google.maps.Polygon({
                strokeColor: this.stockBlack,
                paths: coordinates
              });
              bounds.union(shape.getBounds());
            }

            this.placesArr.push({ shape: shape, id: place.PlaceId });

            shape.infoWindow = new google.maps.InfoWindow({ content: `<b>${place.Name}</b>` });
            shape.infoWindow.setPosition(getLatLng(place.CenterCoordinate));

            google.maps.event.addListener(shape, "mouseover", function () { this.shapeOver(shape) }.bind(this));
            google.maps.event.addListener(shape, "mouseout", function () { this.shapeOut(shape) }.bind(this));

            setTimeout(function () {
              var placeElement = document.getElementById(place.PlaceId);
              if (placeElement) {
                placeElement.addEventListener("mouseover", function () { this.shapeOver(shape, bounds) }.bind(this));
                placeElement.addEventListener("mouseout", function () { this.shapeOut(shape) }.bind(this));
                placeElement.addEventListener("click", function () {
                  if (place.HasCircularGeofence) this.fitBoundToMap({ type: 'circle', overlay: shape });
                  else this.fitBoundToMap({ type: 'polygon', overlay: shape });
                }.bind(this));
              }
            }.bind(this), 500);

            shape.setMap(this.map);
          });

          this.displayBounds = bounds;
          if (this.placeService.subTabIndex.getValue() == 0)
            this.map.fitBounds(bounds);
        }
      });

      // Display suggestions
      this.placeService.subscribeToMostVisitedPlaces().takeUntil(this.ngUnsubscribe).subscribe(places => {
        if (places) {

          let bounds = this.suggestionsBounds ? this.suggestionsBounds : new google.maps.LatLngBounds();
          places.map(place => {

            if (!this.suggestionsArr.find(x => x.id == place.SuggestionPlaceId)) {
              place.GeoCords.map(cord => {
                let marker = new google.maps.Marker({ map: this.map, position: getLatLng(cord) });
                bounds.extend(marker.getPosition());
              });

              var shape = null;
              let geocoder = new google.maps.Geocoder();
              geocoder.geocode({ 'address': place.PlaceName }, function (results, status) {
                if (status === 'OK') {

                  shape = new google.maps.Rectangle({
                    bounds: calcBounds(results[0].geometry.location, new google.maps.Size(200, 200)),
                    strokeColor: this.stockBlackSuggestions,
                    map: this.map
                  });
                  bounds.union(shape.getBounds());

                  this.suggestionsArr.push({ shape: shape, id: place.SuggestionPlaceId });

                  shape.infoWindow = new google.maps.InfoWindow({ content: `<b>${place.PlaceName}</b>` });
                  shape.infoWindow.setPosition(results[0].geometry.location);

                  google.maps.event.addListener(shape, "mouseover", function () { this.shapeOver(shape) }.bind(this));
                  google.maps.event.addListener(shape, "mouseout", function () { this.shapeOut(shape, true) }.bind(this));

                  setTimeout(function () {
                    var placeElement = document.getElementById(place.SuggestionPlaceId);
                    if (placeElement) {
                      placeElement.addEventListener("mouseover", function () { this.shapeOver(shape, bounds) }.bind(this));
                      placeElement.addEventListener("mouseout", function () { this.shapeOut(shape, true) }.bind(this));
                      placeElement.addEventListener("click", function () { this.fitBoundToMap({ type: 'rectangle', overlay: shape }) }.bind(this));
                    }
                  }.bind(this), 500);

                  shape.setMap(this.map);
                }
              }.bind(this));
            }
          });

          this.suggestionsBounds = bounds;
          if (this.placeService.subTabIndex.getValue() == 1)
            this.map.fitBounds(bounds);
        }
      });

      // Set map bounds on change of tab
      this.placeService.subscribeSelectedTab().takeUntil(this.ngUnsubscribe).subscribe(index => {
        if (this.map) {
          if (index == 0 && this.displayBounds)
            this.map.fitBounds(this.displayBounds);
          else if (index == 1 && this.suggestionsBounds)
            this.map.fitBounds(this.suggestionsBounds);

          setTimeout(function () {
            this.suggestionsArr.map(d => {
              var placeElement = document.getElementById(d.id);
              if (placeElement) {
                placeElement.addEventListener("mouseover", function () { this.shapeOver(d.shape, this.suggestionsBounds) }.bind(this));
                placeElement.addEventListener("mouseout", function () { this.shapeOut(d.shape, true) }.bind(this));
                placeElement.addEventListener("click", function () { this.fitBoundToMap({ type: 'rectangle', overlay: d.shape }) }.bind(this));
              }
            });
          }.bind(this), 500);

        }
      });

    }
  }

  // mouseover event of place/shape
  shapeOver(shape, bounds = null) {
    if (bounds)
      this.map.fitBounds(bounds);
    shape.setOptions({ strokeColor: this.stockBlue, fillColor: this.stockBlue });
    shape.infoWindow.open(this.map, shape);
  }

  // mouseout event of place/shape
  shapeOut(shape, suggestions = false) {
    shape.setOptions({ strokeColor: suggestions ? this.stockBlackSuggestions : this.stockBlack, fillColor: suggestions ? this.stockBlackSuggestions : this.stockBlack });
    shape.infoWindow.close();
  }

  // handle click event of placearea
  onClickPlaceArea(e) {
    google.maps.event.addListener(this.placeArea, 'click', function (e) {
      // Check if click was on a vertex control point
      if (e.vertex == undefined)
        return;
      if (this.placeArea.getPath().getLength() < 4) {
        this.notifyService.alert('Polygon must be required minimum three points.');
        return;
      }

      var div = document.createElement('div');
      div.className = 'delete-place';
      div.innerHTML = 'Delete';

      var menu = this;
      google.maps.event.addDomListener(div, 'click', function (event) {
        this.placeArea.getPath().removeAt(e.vertex);
        this.closeAllInfoWindows();
      }.bind(this));

      var infowindow = new google.maps.InfoWindow({ position: e.latLng, content: div });
      infowindow.open(this.map);
      this.infoWindows.push(infowindow);
    }.bind(this));

    if (e.type == 'polygon') {
      var place_polygon_path = this.placeArea.getPath()
      google.maps.event.addListener(place_polygon_path, 'set_at', function () { this.drawPlace(e) }.bind(this));
      google.maps.event.addListener(place_polygon_path, 'insert_at', function () { this.drawPlace(e) }.bind(this));
      google.maps.event.addListener(place_polygon_path, 'remove_at', function () { this.drawPlace(e) }.bind(this));
    }
    else {
      google.maps.event.addListener(this.placeArea, 'radius_changed', function () { this.drawPlace(e) }.bind(this));
      google.maps.event.addListener(this.placeArea, 'center_changed', function () { this.drawPlace(e) }.bind(this));
      this.placeService.getCircleRadius().takeUntil(this.ngUnsubscribe).subscribe(obj => {
        if (obj && obj.radius)
          this.placeArea.setRadius(obj.radius);
      });
    }

    this.drawPlace(e);

  }

  // handle Esc key event
  onEscKeyUp() {
    google.maps.event.addDomListener(document, 'keyup', function (e) {
      var code = (e.keyCode ? e.keyCode : e.which);
      if (code === 27) {
        this.closeAllInfoWindows();
        this.drawingManager.setDrawingMode(null);
        if (this.placeArea)
          this.placeArea.setMap(null);
        this.resetPlaceArea.emit(null);
      }
    }.bind(this));
  }

  // draw place on event changed
  drawPlace(e) {
    this.fitBoundToMap(e);
    this.drawPlaceArea.emit(e);
  }

  // set bounds to map
  fitBoundToMap(e) {
    var bounds = new google.maps.LatLngBounds();
    bounds.union(e.overlay.getBounds());
    this.map.fitBounds(bounds);
  }

  // close all infowindows
  closeAllInfoWindows() {
    for (var i = 0; i < this.infoWindows.length; i++) {
      this.infoWindows[i].close();
    }
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    this.placeService.clearDrawingMode();
    this.placeService.clearCircleRadius();
    this.placeService.clearPlaceDetail();
    this.placeService.clearMostVisitedPlaces();
    this.placeService.resetSelectedTab();
  }

}
