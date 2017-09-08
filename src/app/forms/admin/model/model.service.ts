import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { State, toDataSourceRequestString } from '@progress/kendo-data-query';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { Observable } from 'rxjs/Rx';

import { ModelListViewModel, ModelViewModel } from "app/model/ModelViewModel";
import { DropDownViewModel } from "app/model/ClientModel";
import { ApiResponseModel } from "app/model/ApiResponseModel";

@Injectable()
export class ModelService {
  http: Http;
  allData: ModelListViewModel[] = new Array<ModelListViewModel>();
  allData$: BehaviorSubject<ModelListViewModel[]>;
  constructor(_http: Http) {
    this.http = _http;
    this.allData$ = <BehaviorSubject<ModelListViewModel[]>>new BehaviorSubject(new Array<ModelListViewModel>());
  }

  setFilterDataSet() {
    var listItems: Array<DropDownViewModel> = [];
    listItems.push({ Id: "All", Name: "All" });
    listItems.push({ Id: "Name", Name: "Name" });
    listItems.push({ Id: "ManufacturerName", Name: "Manufacturer" });
    listItems.push({ Id: "ModelTypeName", Name: "Model Type" });
    listItems.push({ Id: "ProductUrl", Name: "Url" });
    listItems.push({ Id: "GatewayName", Name: "Gateway" });
    return listItems;
  }

  loadAll(state: State) {
    const queryStr = `${toDataSourceRequestString(state)}`;
    return this.http.get(`private/model/getall?${queryStr}`)
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
  subscribeToDataService(): Observable<ModelListViewModel[]> {
    return this.allData$.asObservable();
  }

  remove(modelId: string) {
    return this.http.get(`private/model/delete?id=${modelId}`)
      .map(respose => respose.json());
  }
  getById(modelId: string) {
    return this.http.get(`private/model/getbyid?id=${modelId}`)
      .map(respose => respose.json());
  }

  verifyModel(name: string, modelId: string): Observable<ApiResponseModel> {
    return this.http.get('private/model/verifymodel', { params: { name: name, id: modelId } })
      .map(response => response.json());
  }

  saveData(modelObj: ModelViewModel): Observable<ApiResponseModel> {
    return this.http.post('private/model/save', modelObj).map(respose => respose.json());
  }
}
