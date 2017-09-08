import { Component, OnInit } from '@angular/core';
import { ManufacturerService } from "app/forms/admin/manufacturer/manufacturer.service";
import { ConfirmPopup } from "app/components/wrapper/confirm-popup";
import { NotifyService } from "app/services/notification.service";
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { SortDescriptor, CompositeFilterDescriptor, State, FilterDescriptor, process } from '@progress/kendo-data-query';
import { DropDownViewModel } from "app/model/ClientModel";
import { PageChangeEvent, GridComponent } from '@progress/kendo-angular-grid';
import { ModelService } from "app/forms/admin/model/model.service";
import { ModelListViewModel } from "app/model/ModelViewModel";

@Component({
  selector: 'model-display',
  templateUrl: './display.component.html'
})

export class DisplayComponent implements OnInit {
  constructor(private modelService: ModelService, private confirmPopup: ConfirmPopup, private notifyService: NotifyService, private router: Router) {
    this.filterDataSource = modelService.setFilterDataSet();
  }
  model: any = {};
  filterDataSource: Array<DropDownViewModel> = [];
  filterText: Array<DropDownViewModel> = [];
  kgDataSource: Observable<ModelListViewModel[]>;
  kgPageSize: number = 10;
  kgSkip: number = 0;
  kgSort: SortDescriptor[] = [];
  kgState: State = {};
  kgFilter: CompositeFilterDescriptor;
  ngOnInit() {
    this.model.ddlFilter = this.filterDataSource[0];
    this.setCompositeFilters();
    this.kgDataSource = this.modelService.subscribeToDataService();
    this.modelService.loadAll(this.kgState);
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
    this.modelService.loadAll(this.kgState);
  }

  removeHandler({ dataItem }) {
    this.confirmPopup.openConfirmation("Are you sure to delete this Model?").then(res => {
      this.modelService.remove(dataItem.ModelId).subscribe(data => {
        this.notifyService.success('Model deleted successfully.');
        this.refreshGrid();
      });
    });
  }

  editHandler({ dataItem }) {
    this.router.navigate(['/admin/tools/model/' + dataItem.ModelId]);
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
