import { Component, OnInit } from '@angular/core';
import { ClientService } from '../client.service';
import { Observable } from 'rxjs/Rx';
import { State } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor, CompositeFilterDescriptor, FilterDescriptor } from '@progress/kendo-data-query';
import { ClientDetailComponent } from '../detail/detail.component';
import { Client, DropDownViewModel } from '../../../../model/ClientModel';
import { Router } from '@angular/router';
import { NotifyService } from '../../../../services/notification.service';
import { ConfirmPopup } from "app/components/wrapper/confirm-popup";

@Component({
    moduleId: module.id,
    selector: 'client-display',
    templateUrl: './display.component.html'
})

export class ClientDisplayComponent implements OnInit {

    filterDataSource: Array<DropDownViewModel> = [];
    filterText: Array<DropDownViewModel> = [];
    model: any = {};
    kgDataSource: Observable<Client[]>;
    kgPageSize: number = 10;
    kgSkip: number = 0;
    kgSort: SortDescriptor[] = [];
    kgState: State = {};
    kgFilter: CompositeFilterDescriptor;

    constructor(private clientService: ClientService, private router: Router, private notifyService: NotifyService, private confirmPopup: ConfirmPopup) {
        this.filterDataSource = clientService.setFilterDataSet();
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

    refreshGrid() {
        this.kgState.filter = this.kgFilter;
        this.clientService.loadAll(this.kgState);
    }

    ngOnInit(): void {
        this.model.ddlFilter = this.filterDataSource[0];
        this.setCompositeFilters();

        this.kgDataSource = this.clientService.subscribeToDataService();
        this.clientService.loadAll(this.kgState);
    }

    stateChange(state: State) {
        this.kgState = state;
        this.refreshGrid();
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

    pageChange(event: PageChangeEvent) {
        this.kgSkip = event.skip;
    }

    sortChange(sort: SortDescriptor[]): void {
        this.kgSort = sort;
    }

    editHandler({ dataItem }) {
        this.router.navigate(['/admin/settings/client/' + dataItem.ClientId + '/tab']);
    }

    removeHandler({ dataItem }) {
        this.confirmPopup.openConfirmation("Are you sure to delete this Client?").then(res => {
            this.clientService.remove(dataItem.ClientId).subscribe(data => {
                this.notifyService.success('Client deleted successfully.');
                this.refreshGrid();
            });
        });
    }

    addClient() {
        this.router.navigate(['/admin/settings/client/new/tab']);
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
}
