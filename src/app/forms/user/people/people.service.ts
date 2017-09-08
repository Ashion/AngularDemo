import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, toDataSourceRequestString } from '@progress/kendo-data-query';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PeopleList, People } from "../../../model/PeopleModel";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ApiResponseModel } from "app/model/ApiResponseModel";


@Injectable()
export class PeopleService {
  http: Http;
  allData: PeopleList[] = new Array<PeopleList>();
  allData$: BehaviorSubject<PeopleList[]>;

  constructor(_http: Http) {
    this.http = _http;
    this.allData$ = <BehaviorSubject<PeopleList[]>>new BehaviorSubject(new Array<PeopleList>());

  }

  loadAll(state: State, text: any) {
    const queryStr = `${toDataSourceRequestString(state)}`;
    return this.http.get(`/private/people/getall?${queryStr}&filterText=${text}`)
      .map(response => {
        let res = response.json();
        console.log(res);
        return (<GridDataResult>{
          data: res.Result.Data,
          total: res.Result.Total
        })
      })
      .subscribe((data: any) => {
        this.allData = data;
        this.allData$.next(data);
      });
  }
  subscribeToDataService(): Observable<PeopleList[]> {
    return this.allData$.asObservable();
  }

  PeopleActivation(id: any) {
    return this.http.get(`${'/private/people/activeinactive'}/${id}`)
      .map(respose => respose.json());
  }

  remove(peopleId: string) {
    return this.http.get(`${'/private/people/delete'}/${peopleId}`)
      .map(respose => respose.json());
  }

  driverTagList(filterText: string, peopleId: string) {
    return this.http.get(`${'/private/binding/getallDriverTag'}/?peopleId=${peopleId}&filterText=${filterText}`)
      .map(respose => respose.json());
  }

  VerifyEmail(filterText: string) {
    return this.http.get(`${'/private/binding/verifyemail'}/?filterText=${filterText}`)
      .map(respose => respose.json());

  }

  addOrUpdate(people: People) {
    return this.http.post('/private/people/addorupdate', people)
      .map(response => response.json());
  }
  getPersonById(Id: string) {
    return this.http.get(`${'/private/people/getbyid'}/${Id}`)
      .map(response => response.json());
  }

  getSecurityRoles() {
    return this.http.get(`${'/private/binding/getsecurityrole'}`)
      .map(response => response.json());
  }

  getVehicleList(Id: string): Observable<ApiResponseModel> {
    return this.http.get(`private/people/getvehiclelist?Id=${Id}`)
      .map(response => response.json());
  }

  getClientGroupList(): Observable<ApiResponseModel> {
    return this.http.get('/private/people/getclientgroup')
      .map(response => response.json());
  }
}
