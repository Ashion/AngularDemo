import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { map as _map, includes as _includes } from "lodash";

import { FleetService } from "../fleet.service";

@Component({
  selector: 'fleet-navigation',
  templateUrl: './navigation.component.html'
})

export class NavigationComponent {

  authUserObj: any;
  isLogbook: boolean = null;
  vehicleId: string = "";
  vehicleDetail: any = null;

  clientVehicleListResult: any = null;
  clientVehicleList: any = null;

  openGroupPopup: boolean = false;
  openGroupList: boolean = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fleetService: FleetService
  ) {
    this.isLogbook = this.router.url.indexOf("logbook") != -1;
  }

  ngOnInit() {
    this.vehicleId = this.router.url.split(/[/]+/).pop();

    this.fleetService.getVehicleList().subscribe(res => {
      this.clientVehicleListResult = this.clientVehicleList = res.Result;

      res.Result.map(x => {
        x.VehicleList.map(v => {
          if (v.Id == this.vehicleId)
            this.vehicleDetail = { VehicleId: v.Id, Name: v.Name };
        })
      });

    });

  }

  // filter for search vehicle
  searchVehicle(event: Event) {
    let searchText = (<HTMLInputElement>event.target).value.toLowerCase();
    let clientVehicleList = [];
    _map(this.clientVehicleListResult, clientGroup => {
      let obj = Object.assign({}, clientGroup);
      obj.VehicleList = [];
      _map(clientGroup.VehicleList, list => {
        if (_includes(list.Name.toLowerCase(), searchText))
          obj.VehicleList.push(list);
      });
      clientVehicleList.push(obj);
    });
    this.clientVehicleList = clientVehicleList;
  }

  // handle keyup for search textbox
  searchKeyUp(e, element) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code === 27) {
      this.clearFilter(element);
    }
  }

  // clear filter
  clearFilter(element: HTMLInputElement) {
    this.clientVehicleList = Object.assign([], this.clientVehicleListResult);
    element.value = ''
  }

  // get vehicle list by client groupid
  getList(clientVehicleList, clientGroupId) {
    let obj = clientVehicleList.find(x => x.ClientGroupId == clientGroupId);
    return obj.VehicleList;
  }

  // get vehicle list count by client groupid
  getListCount(clientVehicleList, clientGroupId) {
    let obj = clientVehicleList.find(x => x.ClientGroupId == clientGroupId);
    return obj.VehicleList.length;
  }

  // change vehicle to display data
  onSelectVehicle(id, name) {
    this.router.navigate([this.router.url.replace(this.vehicleId, id)]);
    this.vehicleId = id;
    this.vehicleDetail = { VehicleId: id, Name: name };
    this.openGroupList = !this.openGroupList
  }

}
