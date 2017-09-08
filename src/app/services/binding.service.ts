import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Http } from '@angular/http';
import { ApiResponseModel } from "../model/ApiResponseModel";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class BindingService {
    Http: Http;
    constructor(_http: Http) {
        this.Http = _http;
    }
    getClientType(): Observable<ApiResponseModel> {
        return this.Http.get('private/binding/clienttype')
            .map(response => response.json());
    }
    getCountry(): Observable<ApiResponseModel> {
        return this.Http.get('private/binding/country')
            .map(response => response.json());
    }
    getClientGroup(clientId: string = null): Observable<ApiResponseModel> {
        return this.Http.get('private/binding/clientgroup?clientid=' + clientId)
            .map(response => response.json());
    }
    getBaseClientRole(): Observable<ApiResponseModel> {
        return this.Http.get('private/binding/baseclientrole')
            .map(response => response.json());
    }
    getManufacturer(): Observable<ApiResponseModel> {
        return this.Http.get('private/binding/manufacturer')
            .map(response => response.json());
    }
    getModelType(): Observable<ApiResponseModel> {
        return this.Http.get('private/binding/modeltype')
            .map(response => response.json());
    }
    getTerritory(): Observable<ApiResponseModel> {
        return this.Http.get('private/binding/territory')
            .map(response => response.json());
    }
    getTimezone(): Observable<ApiResponseModel> {
        return this.Http.get('private/binding/timezone')
            .map(response => response.json());
    }
    getGroupBindings(): Observable<ApiResponseModel> {
        return this.Http.get('private/binding/getgroupbindings')
            .map(response => response.json());
    }
    getGroupVehicleBindings(): Observable<ApiResponseModel> {
        return this.Http.get('private/binding/getgroupvehiclebindings')
            .map(response => response.json());
    }
}