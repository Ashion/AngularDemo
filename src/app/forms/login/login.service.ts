import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { ApiResponseModel } from "../../model/ApiResponseModel";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';
import { LoginModel } from "../../model/LoginModel";
import { ResetPasswordModel } from "../../model/ResetPasswordModel";
import { ChangePasswordModel } from '../../model/ChangePasswordModel';

import 'rxjs/add/operator/map';

@Injectable()
export class LoginService {
  Http: Http;

  constructor(_http: Http) {
    this.Http = _http;
  }

  login(loginModel: LoginModel): Observable<ApiResponseModel> {
    return this.Http.post('/public/token', loginModel)
      .map(response => response.json())
  }

  dummy(): Observable<ApiResponseModel> {
    return this.Http.get('/private/auth/dummy')
      .map(response => response.json());
  }

  forgotPassword(userName: string): Observable<ApiResponseModel> {
    return this.Http.post('/public/forgotpassword', JSON.stringify(userName))
      .map(response => response.json());
  }

  varifyResetLink(cacheKey): Observable<ApiResponseModel> {
    return this.Http.get('/public/checkresetlink?cacheKey=' + cacheKey)
      .map(response => response.json());
  }

  resetPassword(resetModel: ResetPasswordModel): Observable<ApiResponseModel> {
    return this.Http.post('/public/resetpassword', resetModel)
      .map(response => response.json());
  }

  forceChangePassword(changePasswordModel: ChangePasswordModel): Observable<ApiResponseModel> {
    return this.Http.post('/public/forcechangepassword', changePasswordModel)
      .map(response => response.json());
  }

}
