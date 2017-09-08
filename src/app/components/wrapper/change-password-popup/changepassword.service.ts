import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { ApiResponseModel } from "../../../model/ApiResponseModel";
import { ChangePasswordModel } from '../../../model/ChangePasswordModel';

@Injectable()
export class ChangePasswordService {
    http: Http;

    constructor(_http: Http) {
        this.http = _http;
    }

    changePassword(changePasswordModel: ChangePasswordModel): Observable<ApiResponseModel> {
        return this.http.post("/private/people/changepassword", changePasswordModel)
            .map(response => response.json());
    }
}