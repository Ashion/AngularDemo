import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { State, toDataSourceRequestString } from '@progress/kendo-data-query';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { Observable } from 'rxjs/Rx';
import { DropDownViewModel } from "app/model/ClientModel";
import { ApiResponseModel } from "app/model/ApiResponseModel";
import { DriverTagListViewModel } from "app/model/DriverTagModel";

@Injectable()
export class DrivertagService {

  http: Http;
  allData: DriverTagListViewModel[] = new Array<DriverTagListViewModel>();
  allData$: BehaviorSubject<DriverTagListViewModel[]>;


  constructor(_http: Http) {
    this.http = _http;
    this.allData$ = <BehaviorSubject<DriverTagListViewModel[]>>new BehaviorSubject(new Array<DriverTagListViewModel>());
  }

  setFilterDataSet() {
    var listItems: Array<DropDownViewModel> = [];
    listItems.push({ Id: "All", Name: "All" });
    listItems.push({ Id: "Tag", Name: "Driver Tag" });
    listItems.push({ Id: "Client", Name: "Client Name" });
    listItems.push({ Id: "Group", Name: "Client Group" });
    listItems.push({ Id: "DriverName", Name: "Driver Name" });
    return listItems;
  }
  loadAll(state: State) {
    const queryStr = `${toDataSourceRequestString(state)}`;
    return this.http.get(`private/drivertag/getall?${queryStr}`)
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
  subscribeToDataService(): Observable<DriverTagListViewModel[]> {
    return this.allData$.asObservable();
  }

  remove(manufacturerId: string) {
    return this.http.get(`private/drivertag/delete?id=${manufacturerId}`)
      .map(respose => respose.json());
  }
  getById(manufacturerId: string) {
    return this.http.get(`private/drivertag/getbyid?id=${manufacturerId}`)
      .map(respose => respose.json());
  }

  save(manufacturerObj: DriverTagListViewModel): Observable<ApiResponseModel> {
    return this.http.post('private/drivertag/addorupdate', manufacturerObj)
      .map(response => response.json());
  }

  verifyDriverTag(name: string, driverTagId: string): Observable<ApiResponseModel> {
    return this.http.get('private/drivertag/verifydrivertag', { params: { name: name, id: driverTagId } })
      .map(response => response.json());
  }

}
