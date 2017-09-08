import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { NotifyService } from 'app/services/notification.service';
import { Observable } from 'rxjs/Rx';
import { AlertService } from '../alerts.service';
import * as moment from "moment";

@Component({
  selector: 'alerts-display',
  templateUrl: './display.component.html'
})

export class DisplayComponent implements OnInit, OnDestroy {

  filterText: string;
  kgDataSource: Observable<any[]>;
  kgPageSize: number = 10;
  kgSkip: number = 0;
  kgSort: SortDescriptor[] = [];
  kgState: State = {};

  _moment = moment;

  constructor(
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.kgDataSource = this.alertService.subscribeToGridData();
    this.alertService.loadGridData(this.kgState, "");
  }

  onStateChange(state: State) {
    this.kgState = state;
    this.alertService.loadGridData(this.kgState, "");
  }

  pageChange(event: PageChangeEvent) {
    this.kgSkip = event.skip;
  }

  sortChange(sort: SortDescriptor[]): void {
    this.kgSort = sort;
  }

  fileter() {
    this.alertService.loadGridData(this.kgState, this.filterText);
  }

  ngOnDestroy() {

  }
}
