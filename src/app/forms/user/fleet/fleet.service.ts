import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, toDataSourceRequestString } from '@progress/kendo-data-query';
import { map as _map } from "lodash";

import { PeopleList } from "../../../model/PeopleModel";
import { MapService } from './../../../services/map.service';
import { environment } from "../../../../environments/environment";

import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ApiResponseModel } from "app/model/ApiResponseModel";
import { dtToTimezone, getStatus } from "app/shared/globals";
import { ManageVehicleModel } from "app/model/ManageVehicle";

@Injectable()
export class FleetService {
  http: Http;
  subGridData = new BehaviorSubject(null);
  subVehicleDetail = new BehaviorSubject(null);
  subLoading = new BehaviorSubject(false);
  subVehiclePosition = new BehaviorSubject(null);
  subVehicleTrip = new BehaviorSubject(null);
  subOdometerHistoryData = new BehaviorSubject(null);
  retrievingText = "Retrieving...";

  constructor(
    _http: Http,
    private mapService: MapService
  ) {
    this.http = _http;
  }

  // get list of vehicle/assets for display
  loadGridData(state: State, text: any) {
    const queryStr = `${toDataSourceRequestString(state)}`;
    return this.http.get(`/private/fleet/getall?${queryStr}&filterText=${text}`)
      .map(response => {
        let res = response.json();
        return (<GridDataResult>{
          data: res.Result.Data,
          total: res.Result.Total
        })
      })
      .subscribe((data: any) => {
        // get address from Geo Location
        _map(data.data, d => {
          if (!d.PlaceName && d.CurrentGeoLocation) {
            d.PlaceName = this.retrievingText;
            this.mapService.getAddress(d.CurrentGeoLocation).subscribe(res => d.PlaceName = res);
          }
        });
        this.subGridData.next(data);
      });
  }

  // subscribe to list of vehicle/assets
  subscribeToGridData(): Observable<any> {
    return this.subGridData.asObservable();
  }

  // get vehicle details by id
  getVehicleById(vehicleId: string, startDt: Date, endDt: Date = null) {
    this.subLoading.next(true);
    if (!endDt) endDt = startDt;
    return this.http.get('private/fleet/getvehiclebyid?id=' + vehicleId + '&startdt=' + startDt.toISOString() + '&enddt=' + endDt.toISOString())
      .map(response => {
        let data = response.json();

        // get address from Geo Location
        if (data.Result && data.Result.VehicleTrips) {
          _map(data.Result.VehicleTrips, (d, i) => {

            // convert dt to timezone
            if (d.JourneyStartDate)
              d.JourneyStartDate = dtToTimezone(d.JourneyStartDate, data.Result.TimezoneRegion);

            if (d.JourneyEndDate)
              d.JourneyEndDate = dtToTimezone(d.JourneyEndDate, data.Result.TimezoneRegion);
            else
              d.Status = getStatus(d.VehicleStatus);

            _map(d.DeviceMessages, m => {
              if (m.MessageReceivedUTC)
                m.MessageReceivedUTC = dtToTimezone(m.MessageReceivedUTC, data.Result.TimezoneRegion);
              if (m.UpdateTimeUTC)
                m.UpdateTimeUTC = dtToTimezone(m.UpdateTimeUTC, data.Result.TimezoneRegion);
            });

            // find place name if not available
            if (!d.FromPlaceName && d.FromGeoLocation) {
              d.FromPlaceName = this.retrievingText;
              this.mapService.getAddress(d.FromGeoLocation).subscribe(res => d.FromPlaceName = res);
            }
            if (!d.DestinationPlaceName && d.DestinationGeoLocation) {
              d.DestinationPlaceName = this.retrievingText;
              this.mapService.getAddress(d.DestinationGeoLocation).subscribe(res => d.DestinationPlaceName = res);
            }

          });

          if (data.Result.NextTripDate)
            data.Result.NextTripDate = dtToTimezone(data.Result.NextTripDate, data.Result.TimezoneRegion);
          if (data.Result.PrevTripDate)
            data.Result.PrevTripDate = dtToTimezone(data.Result.PrevTripDate, data.Result.TimezoneRegion);
        }

        this.setVehicleDetail(data.Result);
        this.subLoading.next(false);
        return data.Result;
      });
  }

  // set vehicle details
  setVehicleDetail(data: any = null, resetData: boolean = true) {
    this.subVehicleDetail.next({ data: data, resetData: resetData });
  }

  // subscribe to vehicle details
  subscribeToVehicleDetail(): Observable<any> {
    return this.subVehicleDetail.asObservable();
  }

  // subscribe to vehicle data loading
  subscribeToLoading(): Observable<any> {
    return this.subLoading.asObservable();
  }

  // set vehicle position details
  setVehiclePosition(data) {
    this.subVehiclePosition.next(data);
  }

  // subscribe to display vehicle position
  subscribeToVehiclePosition(): Observable<any> {
    return this.subVehiclePosition.asObservable();
  }

  // set vehicle trip details
  setVehicleTrip(trip) {
    this.subVehicleTrip.next(trip);
  }

  // subscribe to display vehicle trip
  subscribeToVehicleTrip(): Observable<any> {
    return this.subVehicleTrip.asObservable();
  }

  // get client group with vehicle list
  getVehicleList(): Observable<ApiResponseModel> {
    return this.http.get('private/fleet/getvehiclelist')
      .map(response => response.json());
  }


  /******** Manage Vehicle *********/

  // manage vehicle details by id
  manageVehicleById(vehicleId: string): Observable<ApiResponseModel> {
    return this.http.get('private/fleet/managevehiclebyid?id=' + vehicleId)
      .map(response => response.json());
  }

  // update vehicle details
  updateVehicle(vehicleModel: ManageVehicleModel): Observable<ApiResponseModel> {
    return this.http.post('private/fleet/updatevehicle', vehicleModel)
      .map(response => response.json());
  }

  // check duplicate vehicle name
  verifyVehicleName(text: string, vehicleId: string): Observable<ApiResponseModel> {
    return this.http.get('private/fleet/verifyvehicle', { params: { vehicleName: text, vehicleId: vehicleId } })
      .map(response => response.json());
  }

  // get vehicle label list by vehicle id
  getVehiclelabelById(vehicleId: string): Observable<ApiResponseModel> {
    return this.http.get('private/fleet/getvehiclelabelbyid?vehicleid=' + vehicleId)
      .map(response => response.json());
  }

  // get vehicle color list
  getVehicleColor(): Observable<ApiResponseModel> {
    return this.http.get('private/fleet/getvehiclecolor')
      .map(response => response.json());
  }

  // get current odometer value by vehicle id
  getOdometerById(vehicleId: string): Observable<ApiResponseModel> {
    return this.http.get('private/fleet/getodometerbyid?vehicleid=' + vehicleId)
      .map(response => response.json());
  }

  // Save odometer
  saveOdometer(vehicleId: string, realOdometer: number, currentOdometer: number): Observable<ApiResponseModel> {
    return this.http.post('private/fleet/saveodometer', { vehicleId: vehicleId, realOdometer: realOdometer, odometer: currentOdometer })
      .map(response => response.json());
  }

  // get odometer history for display
  loadOdometerHistory(state: State, vehicleId: string) {
    const queryStr = `${toDataSourceRequestString(state)}`;
    return this.http.get(`/private/fleet/getodometerhistory?${queryStr}&vehicleid=${vehicleId}`)
      .map(response => {
        let res = response.json();
        return (<GridDataResult>{
          data: res.Result.Data,
          total: res.Result.Total
        })
      })
      .subscribe((data: any) => {
        this.subOdometerHistoryData.next(data);
      });
  }

  // subscribe to odometer history
  subscribeToOdometerHistory(): Observable<any> {
    return this.subOdometerHistoryData.asObservable();
  }

  // get current odometer value by vehicle id
  getVehicleStatus(vehicleId: string): Observable<ApiResponseModel> {
    return this.http.get('private/fleet/getvehiclestatus?vehicleid=' + vehicleId)
      .map(response => response.json());
  }

  // change vehicle trip type
  changeVehicleTrip(vehicleTripId: string): Observable<ApiResponseModel> {
    return this.http.post('private/fleet/changevehicletrip', JSON.stringify(vehicleTripId))
      .map(response => response.json());
  }

}
