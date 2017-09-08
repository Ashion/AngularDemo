import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Subject } from 'rxjs/Subject';

import { GridDataResult } from '@progress/kendo-angular-grid';
import { Observable } from 'rxjs/Rx';

import { ApiResponseModel } from "app/model/ApiResponseModel";

@Injectable()
export class LiveTrackingService {
    http: Http;
    public followGroup = new Subject();
    public followVehicle = new Subject();
    public topSwitchChange = new Subject();
    public movingVehicles = new Subject();

    constructor(_http: Http) {
        this.http = _http;
    }

    getLiveVehicles(clientId: string = null): Observable<ApiResponseModel> {
        return this.http.get('private/tracker/getlivetracking?clientid=' + clientId)
            .map(response => response.json());
    }

    setFollowGroupId(id: string) {
        this.followGroup.next(id);
    }

    setFollowVehicleId(ids: Array<string>) {
        this.followVehicle.next(ids);
    }

    setTopSwitchChange(val: boolean) {
        this.topSwitchChange.next(val);
    }

    setMovingVehicles(val: number) {
        this.movingVehicles.next(val)
    }

}
