import { Component, OnInit } from '@angular/core';
import { DeviceService } from "app/forms/admin/device/device.service";
import { ConfirmPopup } from "app/components/wrapper/confirm-popup";
import { NotifyService } from "app/services/notification.service";
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { SortDescriptor, CompositeFilterDescriptor, State, FilterDescriptor, process } from '@progress/kendo-data-query';
import { DeviceListViewModel } from "app/model/DeviceModel";
import { DropDownViewModel } from "app/model/ClientModel";
import { PageChangeEvent, GridComponent } from '@progress/kendo-angular-grid';
import { ExcelExportData } from "@progress/kendo-angular-excel-export/dist/es/excel-export-data";

import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'device-display',
  templateUrl: './display.component.html'
})
export class DisplayComponent implements OnInit {

  constructor(private deviceService: DeviceService, private confirmPopup: ConfirmPopup, private notifyService: NotifyService, private router: Router) {
    this.filterDataSource = deviceService.setFilterDataSet();
  }
  model: any = {};
  filterDataSource: Array<DropDownViewModel> = [];
  filterText: Array<DropDownViewModel> = [];
  kgDataSource: Observable<DeviceListViewModel[]>;
  kgPageSize: number = 10;
  kgSkip: number = 0;
  kgSort: SortDescriptor[] = [];
  kgState: State = {};
  kgFilter: CompositeFilterDescriptor;
  ngOnInit() {
    this.model.ddlFilter = this.filterDataSource[0];
    this.setCompositeFilters();
    this.kgDataSource = this.deviceService.subscribeToDataService();
    this.deviceService.loadAll(this.kgState);
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
    this.deviceService.loadAll(this.kgState);
  }

  public removeHandler({ dataItem }) {
    this.confirmPopup.openConfirmation("Are you sure to delete this Device?").then(res => {
      this.deviceService.remove(dataItem.DeviceId).subscribe(data => {
        this.notifyService.success('Device deleted successfully.');
        this.refreshGrid();
      });
    });
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

  downloadFile() {
    this.deviceService.downloadFile(this.kgState).subscribe(x => {
      if (x.Result[0].Data.length > 0) {
        this.exportAsExcelFile(x.Result[0].Data, "Device List");
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
