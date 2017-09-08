import { Component, OnInit } from '@angular/core';
import { DropDownViewModel } from "app/model/ClientModel";
import { ConfigurationService } from "app/forms/admin/configuration/configuration.service";
import { CompositeFilterDescriptor, FilterDescriptor } from "@progress/kendo-data-query/dist/es/filtering/filter-descriptor.interface";
import { NotifyService } from "app/services/notification.service";
import { Observable } from 'rxjs/Rx';
import { HardwareProfile } from "app/model/ConfigurationModel";
import { SortDescriptor } from "@progress/kendo-data-query/dist/es/sort-descriptor";
import { State } from "@progress/kendo-data-query/dist/es/state";
import { Router } from '@angular/router';
import { ConfirmPopup } from "app/components/wrapper/confirm-popup";
import { PageChangeEvent } from "@progress/kendo-angular-grid/dist/es/change-event-args.interface";

@Component({
  selector: 'configuration-display',
  templateUrl: './display.component.html'
})
export class DisplayComponent implements OnInit {
  filterDataSource: Array<DropDownViewModel> = [];
  filterText: Array<DropDownViewModel> = [];
  model: any = {};
  kgDataSource: Observable<HardwareProfile[]>;
  kgPageSize: number = 10;
  kgSkip: number = 0;
  kgSort: SortDescriptor[] = [];
  kgState: State = {};
  kgFilter: CompositeFilterDescriptor;

  constructor(private configurationService: ConfigurationService, private notifyService: NotifyService, private router: Router, private confirmPopup: ConfirmPopup) {
    this.filterDataSource = configurationService.setFilterDataSet();
  }

  ngOnInit() {
    this.model.ddlFilter = this.filterDataSource[0];
    this.setCompositeFilters();
    this.kgDataSource = this.configurationService.subscribeToDataService();
    this.configurationService.loadAll(this.kgState);
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

  stateChange(state: State) {
    this.kgState = state;
    this.refreshGrid();
  }

  refreshGrid() {
    this.kgState.filter = this.kgFilter;
    this.configurationService.loadAll(this.kgState);
  }

  pageChange(event: PageChangeEvent) {
    this.kgSkip = event.skip;
  }

  sortChange(sort: SortDescriptor[]): void {
    this.kgSort = sort;
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

  public editHandler({ dataItem }) {
    this.router.navigate(['/admin/settings/configuration/' + dataItem.HardwareProfileId + '/tab']);
  }

  public removeHandler({ dataItem }) {
    this.confirmPopup.openConfirmation("Are you sure to delete this Profile?").then(res => {
      this.configurationService.remove(dataItem.HardwareProfileId).subscribe(data => {
        this.notifyService.success('Profile deleted successfully.');
        this.refreshGrid();
      });
    });
  }
}
