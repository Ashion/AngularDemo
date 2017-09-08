import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';

import { GroupEditorService } from "app/forms/user/group-editor/group-editor.service";
import { storageKeys } from "app/shared/globals";

@Component({
    selector: 'vehicle-list',
    templateUrl: 'vehicle.list.component.html'
})

export class VehicleListComponent implements OnInit {
    ClientGroupId: string;
    gridData: GridDataResult;
    gridPageSize: number = 10;
    skip: number = 0;
    items: any[] = [];
    sort: SortDescriptor[] = [];
    filterText: string;
    _router: any;

    constructor(private _groupService: GroupEditorService, router: Router) {
        this.ClientGroupId = localStorage.getItem(storageKeys.groupEditorId);
        this._router = router;
    }

    ngOnInit() {
        if (!this.ClientGroupId) {
            return;
        }
        else {
            this._groupService.getVehicles(this.ClientGroupId).subscribe(res => {
                this.items = res.Result;
                this.loadItems();
            });
        }
    }

    private loadItems(): void {
        this.gridData = {
            data: orderBy(this.items, this.sort).slice(this.skip, this.skip + this.gridPageSize),
            total: this.items.length
        };
    }

    protected pageChange(event: PageChangeEvent): void {
        this.skip = event.skip;
        this.loadItems();
    }

    protected sortChange(sort: SortDescriptor[]): void {
        this.sort = sort;
        this.loadItems();
    }

    protected editHandler(event: any) {

    }

    protected removeHandler(event: any) {

    }

    fileter() {

    }
}