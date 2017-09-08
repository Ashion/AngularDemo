import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ManufacturerModel } from "app/model/ManufacturerModel";
import { State, toDataSourceRequestString } from '@progress/kendo-data-query';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { Observable } from 'rxjs/Rx';
import { DropDownViewModel } from "app/model/ClientModel";
import { ApiResponseModel } from "app/model/ApiResponseModel";

@Injectable()
export class ManufacturerService {
  http: Http;
  allData: ManufacturerModel[] = new Array<ManufacturerModel>();
  allData$: BehaviorSubject<ManufacturerModel[]>;


  constructor(_http: Http) {
    this.http = _http;
    this.allData$ = <BehaviorSubject<ManufacturerModel[]>>new BehaviorSubject(new Array<ManufacturerModel>());
  }

  setFilterDataSet() {
    var listItems: Array<DropDownViewModel> = [];
    listItems.push({ Id: "All", Name: "All" });
    listItems.push({ Id: "Name", Name: "Name" });
    listItems.push({ Id: "PhoneNumber", Name: "PhoneNumber" });
    listItems.push({ Id: "Website", Name: "Website" });
    return listItems;
  }
  loadAll(state: State) {
    const queryStr = `${toDataSourceRequestString(state)}`;
    return this.http.get(`private/manufacturer/getall?${queryStr}`)
      .map(response => {
        let res = response.json();
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
  subscribeToDataService(): Observable<ManufacturerModel[]> {
    return this.allData$.asObservable();
  }

  remove(manufacturerId: string) {
    return this.http.get(`private/manufacturer/delete?id=${manufacturerId}`)
      .map(respose => respose.json());
  }
  getById(manufacturerId: string) {
    return this.http.get(`private/manufacturer/getbyid?id=${manufacturerId}`)
      .map(respose => respose.json());
  }

  save(manufacturerObj: ManufacturerModel): Observable<ApiResponseModel> {
    return this.http.post('private/manufacturer/addorupdate', manufacturerObj)
      .map(response => response.json());
  }

  downloadFile(state: State) {
    const queryStr = `${toDataSourceRequestString(state)}`;
    return this.http.get(`private/manufacturer/download?${queryStr}`)
      .map(respose => respose.json());
  }

}
