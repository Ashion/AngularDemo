import { Injectable, Optional } from '@angular/core';
import { Http } from '@angular/http';
import { ApiResponseModel } from 'app/model/ApiResponseModel';
import { Observable } from 'rxjs/Observable';
import { PlaceAlertModel } from "app/model/Alert";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, toDataSourceRequestString } from '@progress/kendo-data-query';

@Injectable()
export class AlertService {
    http: Http;
    subGridData = new BehaviorSubject(null);

    constructor(_http: Http) {
        this.http = _http;
    }

    // get list of place alert for display
    loadGridData(state: State, text: any) {
        const queryStr = `${toDataSourceRequestString(state)}`;
        return this.http.get(`private/alert/getall?${queryStr}&filterText=${text}`)
            .map(response => {
                let res = response.json();
                return (<GridDataResult>{
                    data: res.Result.Data,
                    total: res.Result.Total
                })
            })
            .subscribe((data: any) => {
                this.subGridData.next(data);
            });
    }

    // subscribe to list of alerts
    subscribeToGridData(): Observable<any> {
        return this.subGridData.asObservable();
    }

    getPlaceBinding(): Observable<ApiResponseModel> {
        return this.http.get('private/alert/placebinding')
            .map(response => response.json());
    }

    // Add/Edit place alert
    save(alertModel: PlaceAlertModel): Observable<ApiResponseModel> {
        return this.http.post('private/alert/saveplacealert', alertModel)
            .map(response => response.json());
    }

}