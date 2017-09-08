import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { ApiResponseModel } from "../../../model/ApiResponseModel";

import 'rxjs/add/operator/map';

@Injectable()
export class TrackingLogService {
    Http: Http;

    constructor(_http: Http) {
        this.Http = _http;
    }

    getVehicleList(): Observable<ApiResponseModel> {
        return this.Http.get('/private/tracker/getvehiclelist')
            .map(response => response.json());
    }

    getVehicleTripList(date: Date): Observable<ApiResponseModel> {
        return this.Http.get('/private/tracker/getvehicletrip?date=' + date.toDateString())
            .map(response => response.json());
    }
}