import { getStatus } from 'app/shared/globals';
import { StatusDetailModel, ActivityStatusModel } from 'app/model/Common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { FleetService } from "../fleet.service";
import { PlaceService } from "../../places/place.service";
import { PeopleList } from "../../../../model/PeopleModel";
import { State } from '@progress/kendo-data-query';
import { SortDescriptor, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { NotifyService } from "app/services/notification.service";
import { Router } from '@angular/router';
import { ConfirmPopup } from "app/components/wrapper/confirm-popup";

@Component({
  selector: 'fleet-display',
  templateUrl: './display.component.html'
})
export class DisplayComponent implements OnInit {
  public filterText: string;
  kgDataSource: Observable<PeopleList[]>;
  kgPageSize: number = 10;
  kgSkip: number = 0;
  kgSort: SortDescriptor[] = [];
  kgState: State = {};

  constructor(
    private fleetService: FleetService,
    private confirmPopup: ConfirmPopup,
    private _notify: NotifyService,
    private router: Router
  ) { }

  ngOnInit() {
    this.kgDataSource = this.fleetService.subscribeToGridData();
    this.fleetService.loadGridData(this.kgState, "");
  }

  onStateChange(state: State) {
    this.kgState = state;
    this.refreshGrid();
  }

  refreshGrid() {
    this.fleetService.loadGridData(this.kgState, "");
  }

  pageChange(event: PageChangeEvent) {
    this.kgSkip = event.skip;
  }

  sortChange(sort: SortDescriptor[]): void {
    this.kgSort = sort;
  }

  fileter() {
    this.fleetService.loadGridData(this.kgState, this.filterText);
  }

  onClickGroupList() {
    alert('Not implemented yet');
  }

  setStatusColor(statusDetail: StatusDetailModel) {
    let status = getStatus(statusDetail) as ActivityStatusModel;
    return { 'color': status.ColorCode };
  }

}
