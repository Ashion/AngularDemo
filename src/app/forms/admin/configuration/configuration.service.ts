import { Injectable } from '@angular/core';
import { DropDownViewModel } from "app/model/ClientModel";
import { Http } from '@angular/http';
import { HardwareProfile } from "app/model/ConfigurationModel";
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { State, toDataSourceRequestString } from '@progress/kendo-data-query';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { ApiResponseModel } from "app/model/ApiResponseModel";

@Injectable()
export class ConfigurationService {
  http: Http;
  allData: HardwareProfile[] = new Array<HardwareProfile>();
  allData$: BehaviorSubject<HardwareProfile[]>;
  topMenuChange = new BehaviorSubject(null);

  constructor(_http: Http) {
    this.http = _http;
    this.allData$ = <BehaviorSubject<HardwareProfile[]>>new BehaviorSubject(new Array<HardwareProfile>());
  }

  setFilterDataSet() {
    var listItems: Array<DropDownViewModel> = [];
    listItems.push({ Id: "All", Name: "All" });
    listItems.push({ Id: "ProfileName", Name: "Profile Name" });
    listItems.push({ Id: "ProtocolName", Name: "Protocol" });
    listItems.push({ Id: "PortNumber", Name: "Port" });
    listItems.push({ Id: "ParserName", Name: "Parser" });
    listItems.push({ Id: "Description", Name: "Description" });
    return listItems;
  }

  loadAll(state: State) {
    const queryStr = `${toDataSourceRequestString(state)}`;
    return this.http.get(`private/configuration/getall?${queryStr}`)
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

  subscribeToDataService(): Observable<HardwareProfile[]> {
    return this.allData$.asObservable();
  }

  getParserList(): Observable<ApiResponseModel> {
    return this.http.get('private/configuration/getparserlist')
      .map(response => response.json());
  }

  save(hardwareProfiile: HardwareProfile): Observable<ApiResponseModel> {
    return this.http.post('private/configuration/addorupdate', hardwareProfiile)
      .map(response => response.json());
  }

  getHardwareProfileById(Id: string): Observable<ApiResponseModel> {
    return this.http.get(`private/configuration/getbyid?id=${Id}`)
      .map(response => response.json());
  }

  remove(HardwareProfileId: string) {
    return this.http.get(`${'/private/configuration/delete'}/${HardwareProfileId}`)
      .map(respose => respose.json());
  }

  IsPortProtocolCombination(profileId: string, port: string, protocol: string) {
    return this.http.get(`private/configuration/isprotocolandportunique?port=${port}&protocol=${protocol}&profileId=${profileId}`)
      .map(respose => respose.json());
  }
}
