import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Http } from '@angular/http';
import { AnnouncementModel, DisplayAnnouncementModel, ItemList } from "app/model/DashboardModel";
import { Observable } from "rxjs/Observable";
import { ApiResponseModel } from "app/model/ApiResponseModel";
import { DropDownViewModel } from "app/model/ClientModel";
import { State, toDataSourceRequestString } from '@progress/kendo-data-query';
import { GridDataResult } from '@progress/kendo-angular-grid';


@Injectable()
export class DashboardService {
  http: Http;
  public newAnnouncement = new BehaviorSubject(null);

  allData: ItemList[] = new Array<ItemList>();
  allData$: BehaviorSubject<ItemList[]>;

  constructor(_http: Http) {
    this.http = _http;
    this.allData$ = <BehaviorSubject<ItemList[]>>new BehaviorSubject(new Array<ItemList>());
  }

  setFilterDataSet() {
    var listItems: Array<DropDownViewModel> = [];
    listItems.push({ Id: "All", Name: "All" });
    listItems.push({ Id: "Territory", Name: "Territory" });
    listItems.push({ Id: "Entity", Name: "Entity Name" });
    listItems.push({ Id: "Imei", Name: "IMEI" });
    listItems.push({ Id: "Description", Name: "Description" });
    listItems.push({ Id: "Type", Name: "Entity Type" });
    listItems.push({ Id: "Vin", Name: "VIN" });
    listItems.push({ Id: "Group", Name: "Group Name" });
    return listItems;
  }

  // Save announcement
  saveAnnouncement(announcementObj: AnnouncementModel): Observable<ApiResponseModel> {
    return this.http.post('private/dashboard/saveannouncement', announcementObj)
      .map(response => response.json());
  }

  // get all announcements
  getAnnouncements(peopleId: string): Observable<ApiResponseModel> {
    return this.http.get('private/dashboard/getannouncement', { params: { peopleId: peopleId } })
      .map(response => response.json());
  }

  setNewAnnouncement(announcement) {
    this.newAnnouncement.next(announcement);
  }

  loadAll(state: State) {
    const queryStr = `${toDataSourceRequestString(state)}`;
    return this.http.get(`private/dashboard/getitemlist?${queryStr}`)
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

  subscribeToDataService(): Observable<ItemList[]> {
    return this.allData$.asObservable();
  }

  downloadFile(state: State) {
    const queryStr = `${toDataSourceRequestString(state)}`;
    return this.http.get(`private/dashboard/download?${queryStr}`)
      .map(respose => respose.json());
  }
}
