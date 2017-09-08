import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { SortDescriptor, CompositeFilterDescriptor, State, FilterDescriptor, process } from '@progress/kendo-data-query';
import { DropDownViewModel } from "app/model/ClientModel";
import { ItemList } from "app/model/DashboardModel";
import { DashboardService } from "app/forms/user/dashboard/dashboard.service";
import { ConfirmPopup } from "app/components/wrapper/confirm-popup";
import { PageChangeEvent, GridComponent } from '@progress/kendo-angular-grid';
import { NotifyService } from "app/services/notification.service";

import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


@Component({
  selector: 'dashboard-itemdisplay',
  templateUrl: './itemdisplay.component.html'
})
export class ItemdisplayComponent implements OnInit {

  constructor(private dashboardService: DashboardService, private confirmPopup: ConfirmPopup, private notifyService: NotifyService, private router: Router) {
    this.filterDataSource = dashboardService.setFilterDataSet();
  }
  model: any = {};
  filterDataSource: Array<DropDownViewModel> = [];
  filterText: Array<DropDownViewModel> = [];
  kgDataSource: Observable<ItemList[]>;
  kgPageSize: number = 10;
  kgSkip: number = 0;
  kgSort: SortDescriptor[] = [];
  kgState: State = {};
  kgFilter: CompositeFilterDescriptor;
  ngOnInit() {
    this.model.ddlFilter = this.filterDataSource[0];
    this.setCompositeFilters();
    this.kgDataSource = this.dashboardService.subscribeToDataService();
    this.dashboardService.loadAll(this.kgState);
  }

  setCompositeFilters() {
    this.kgFilter = { logic: "and", filters: [] };
    for (var i of this.filterDataSource) {
      this.kgFilter.filters.push({
        field: i.Id,
        operator: "c",
        value: null
      })
    }
  }

  addFilter() {
    if (this.model.searchText == null || this.model.searchText == '' || this.model.searchText.length == 0) {
      this.notifyService.warn('Please enter search value.');
      return;
    }
    var index = <number>this.filterText.findIndex(item => item.Id == this.model.ddlFilter.Name);
    if (index > -1) {
      this.filterText[index].Name = this.model.searchText;
    }
    else {
      this.filterText.push({ Id: this.model.ddlFilter.Name, Name: this.model.searchText });
    }
    index = <number>this.kgFilter.filters.findIndex(item => (<FilterDescriptor>item).field == this.model.ddlFilter.Id);
    this.kgFilter.filters[index] = {
      field: this.model.ddlFilter.Id,
      operator: "c",
      value: this.model.searchText
    };
    this.refreshGrid();
  }

  onCancelClick(name: string): void {
    var index = <number>this.filterText.findIndex(item => item.Id == name)
    if (index > -1) {
      this.filterText.splice(index, 1);
      var flatItem = this.filterDataSource.filter(function (f) {
        return f.Name == name;
      })[0];
      index = <number>this.kgFilter.filters.findIndex(item => (<FilterDescriptor>item).field == flatItem.Id);
      this.kgFilter.filters[index] = {
        field: flatItem.Id,
        operator: "c",
        value: null
      };
      this.refreshGrid();
    }
  }
  refreshGrid() {
    this.kgState.filter = this.kgFilter;
    this.dashboardService.loadAll(this.kgState);
  }
  editHandler({ dataItem }) {
    this.router.navigate(['/admin/tools/device/' + dataItem.DeviceId]);
  }
  pageChange(event: PageChangeEvent) {
    this.kgSkip = event.skip;
  }

  sortChange(sort: SortDescriptor[]): void {
    this.kgSort = sort;
  }
  stateChange(state: State) {
    this.kgState = state;
    this.refreshGrid();
  }

  public downloadFile() {
    this.dashboardService.downloadFile(this.kgState).subscribe(x => {
      if (x.Result[0].Data.length > 0) {
        this.exportAsExcelFile(x.Result[0].Data, "Item List");
      }
      else {
        this.notifyService.error("Data not found !");
      }
    });
  }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}
