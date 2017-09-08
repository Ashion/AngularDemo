import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { PeopleService } from "../people.service";
import { PeopleList } from "../../../../model/PeopleModel";
import { State } from '@progress/kendo-data-query';
import { SortDescriptor, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { NotifyService } from "app/services/notification.service";
import { Router } from '@angular/router';
import { ConfirmPopup } from "app/components/wrapper/confirm-popup";
import { environment } from "environments/environment";

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html'
})
export class DisplayComponent implements OnInit {
  public view: Observable<PeopleList[]>;
  public filterText: string;
  kgDataSource: Observable<PeopleList[]>;
  kgPageSize: number = 10;
  kgSkip: number = 0;
  kgSort: SortDescriptor[] = [];
  kgState: State = {};
  kgFilter: CompositeFilterDescriptor;
  tempText: string = "Active";
  public filePath: string = "";
  constructor(private peopleService: PeopleService, private confirmPopup: ConfirmPopup, private _notify: NotifyService, private router: Router) {
  }

  ngOnInit() {
    this.filePath = environment.origin + 'Content/';
    this.kgDataSource = this.peopleService.subscribeToDataService();
    this.peopleService.loadAll(this.kgState, "");
  }

  public onStateChange(state: State) {
    this.kgState = state;
    this.refreshGrid();
  }

  private refreshGrid() {
    this.peopleService.loadAll(this.kgState, "");
  }

  public pageChange(event: PageChangeEvent) {
    this.kgSkip = event.skip;
  }

  protected sortChange(sort: SortDescriptor[]): void {
    this.kgSort = sort;
  }

  public fileter() {
    this.peopleService.loadAll(this.kgState, this.filterText);
  }

  public editHandler({ dataItem }) {

    this.router.navigate(['/user/people/' + dataItem.PeopleId]);
  }
  public peopleActivation(id: any, status: any) {
    this.tempText = (status) ? "de-activate" : "activate";
    this.confirmPopup.openConfirmation("Are you sure to <b>" + this.tempText + "</b> this person?").then(res => {
      this.peopleService.PeopleActivation(id).subscribe(x => {
        this._notify.success("Person updated successfully.");
        this.refreshGrid()
      });
    });
  }

  public removeHandler({ dataItem }) {
    this.confirmPopup.openConfirmation("Are you sure to delete this person?").then(res => {
      this.peopleService.remove(dataItem.PeopleId).subscribe(data => {
        this._notify.success("Person deleted successfully.");
        this.refreshGrid();
      });
    });
  }
}
