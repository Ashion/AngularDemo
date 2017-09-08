import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DeviceListViewModel, DeviceViewModel } from "app/model/DeviceModel";
import { State, toDataSourceRequestString } from '@progress/kendo-data-query';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { Observable } from 'rxjs/Rx';
import { DropDownViewModel } from "app/model/ClientModel";
import { ApiResponseModel } from "app/model/ApiResponseModel";

@Injectable()
export class DeviceService {

  http: Http;
  allData: DeviceListViewModel[] = new Array<DeviceListViewModel>();
  allData$: BehaviorSubject<DeviceListViewModel[]>;


  constructor(_http: Http) {
    this.http = _http;
    this.allData$ = <BehaviorSubject<DeviceListViewModel[]>>new BehaviorSubject(new Array<DeviceListViewModel>());
  }

  setFilterDataSet() {
    var listItems: Array<DropDownViewModel> = [];
    listItems.push({ Id: "All", Name: "All" });
    listItems.push({ Id: "Imei", Name: "IMEI" });
    listItems.push({ Id: "ClientName", Name: "Client" });
    listItems.push({ Id: "GroupName", Name: "Group" });
    listItems.push({ Id: "ModelName", Name: "Model" });
    listItems.push({ Id: "SimId", Name: "SIMID" });
    listItems.push({ Id: "Phone", Name: "Phone" });
    return listItems;
  }

  setConditionSet() {
    var listItems: Array<DropDownViewModel> = [];
    listItems.push({ Id: "1", Name: "New" });
    listItems.push({ Id: "2", Name: "Used" });
    listItems.push({ Id: "3", Name: "Broken" });
    listItems.push({ Id: "4", Name: "Out For Repair" });
    return listItems;
  }

  setEntityTypeSet() {
    var listItems: Array<DropDownViewModel> = [];
    listItems.push({ Id: "0", Name: "Assest" });
    listItems.push({ Id: "1", Name: "Vehicle" });
    return listItems;
  }


  setPNDModeSet() {
    var listItems: Array<DropDownViewModel> = [];
    listItems.push({ Id: "0", Name: "Disabled" });
    listItems.push({ Id: "1", Name: "Emulator" });
    listItems.push({ Id: "2", Name: "Garmin" });
    return listItems;
  }

  loadAll(state: State) {
    const queryStr = `${toDataSourceRequestString(state)}`;
    return this.http.get(`private/device/getall?${queryStr}`)
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
  subscribeToDataService(): Observable<DeviceListViewModel[]> {
    return this.allData$.asObservable();
  }

  remove(deviceId: string) {
    return this.http.get(`private/device/delete?id=${deviceId}`)
      .map(respose => respose.json());
  }

  downloadFile(state: State) {
    const queryStr = `${toDataSourceRequestString(state)}`;
    return this.http.get(`private/device/download?${queryStr}`)
      .map(respose => respose.json());
  }

  getModelList(id: string) {
    return this.http.get(`private/device/getmodellist?id=${id}`)
      .map(respose => respose.json());
  }

  getCarrierList(id: string) {
    return this.http.get(`private/device/getcarrierlist?id=${id}`)
      .map(respose => respose.json());
  }

  getById(id: string) {
    return this.http.get(`private/device/getbyid?id=${id}`)
      .map(respose => respose.json());
  }

  getClientById(id: string) {
    return this.http.get(`private/device/getclientlist?id=${id}`)
      .map(respose => respose.json());
  }

  getGroupById(id: string, clientId: string) {
    return this.http.get(`private/device/getgrouplist?id=${id}&clientId=${clientId}`)
      .map(respose => respose.json());
  }

  getHardwareProfile(id: string) {
    return this.http.get(`private/device/gethardwarelist?id=${id}`)
      .map(respose => respose.json());
  }

  getAssetList(groupId: string) {
    return this.http.get(`private/device/getassetlist?groupId=${groupId}`)
      .map(respose => respose.json());
  }

  getvehicleList(groupId: string) {
    return this.http.get(`private/device/getvehiclelist?groupId=${groupId}`)
      .map(respose => respose.json());
  }

  getMapicon(id: string) {
    return this.http.get(`private/device/getmapicon?id=${id}`)
      .map(respose => respose.json());
  }

  verifyImei(name: string, deviceId: string): Observable<ApiResponseModel> {
    return this.http.get('private/device/verifyimei', { params: { name: name, id: deviceId } })
      .map(response => response.json());
  }

  verifySimId(name: string, deviceId: string): Observable<ApiResponseModel> {
    return this.http.get('private/device/verifysimid', { params: { name: name, id: deviceId } })
      .map(response => response.json());
  }

  addOrUpdate(deviceModel: DeviceViewModel): Observable<ApiResponseModel> {
    return this.http.post('private/device/addorupdate', deviceModel)
      .map(response => response.json());
  }


  IsAssetVehicleAssign(entity: boolean, id: string): Observable<ApiResponseModel> {
    return this.http.get('private/device/verifyentityassign', { params: { entitytype: entity, id: id } })
      .map(response => response.json());
  }

}
