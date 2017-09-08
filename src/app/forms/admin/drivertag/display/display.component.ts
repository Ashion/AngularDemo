import { Component, OnInit } from '@angular/core';
import { DropDownViewModel } from "app/model/ClientModel";
import { SortDescriptor } from "@progress/kendo-data-query/dist/es/sort-descriptor";
import { CompositeFilterDescriptor, FilterDescriptor } from "@progress/kendo-data-query/dist/es/filtering/filter-descriptor.interface";
import { State } from "@progress/kendo-data-query/dist/es/state";
import { ConfirmPopup } from "app/components/wrapper/confirm-popup";
import { DrivertagService } from "app/forms/admin/drivertag/drivertag.service";
import { NotifyService } from "app/services/notification.service";
import { Router } from "@angular/router";
import { PageChangeEvent } from "@progress/kendo-angular-grid/dist/es/change-event-args.interface";
import { DriverTagListViewModel } from "app/model/DriverTagModel";
import { Observable } from "rxjs/Rx";

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html'
})
export class DisplayComponent implements OnInit {

  constructor(private drivertagService: DrivertagService, private confirmPopup: ConfirmPopup, private notifyService: NotifyService, private router: Router) {
    this.filterDataSource = drivertagService.setFilterDataSet();
  }
  model: any = {};
  filterDataSource: Array<DropDownViewModel> = [];
  filterText: Array<DropDownViewModel> = [];
  kgDataSource: Observable<DriverTagListViewModel[]>;
  kgPageSize: number = 10;
  kgSkip: number = 0;
  kgSort: SortDescriptor[] = [];
  kgState: State = {};
  kgFilter: CompositeFilterDescriptor;
  ngOnInit() {
    this.model.ddlFilter = this.filterDataSource[0];
    this.setCompositeFilters();
    this.kgDataSource = this.drivertagService.subscribeToDataService();
    this.drivertagService.loadAll(this.kgState);
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
    this.drivertagService.loadAll(this.kgState);
  }

  public removeHandler({ dataItem }) {
    if (dataItem.IsAssign) {
      this.notifyService.error("Can not delete. Driver Tag is already assigned.");
    }
    else {
      this.confirmPopup.openConfirmation("Are you sure to delete this Driver Tag?").then(res => {
        this.drivertagService.remove(dataItem.Id).subscribe(data => {
          this.notifyService.success('DriverTag deleted successfully.');
          this.refreshGrid();
        });
      });
    }
  }

  editHandler({ dataItem }) {
    this.router.navigate(['/admin/tools/drivertag/' + dataItem.Id]);
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
}
