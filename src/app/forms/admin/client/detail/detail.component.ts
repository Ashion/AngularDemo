import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { RequestOptions, Headers } from "@angular/http";
import { SortDescriptor, orderBy, State, CompositeFilterDescriptor, FilterDescriptor } from '@progress/kendo-data-query';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';

import { FileRestrictions, SelectEvent, ClearEvent, RemoveEvent } from '@progress/kendo-angular-upload';
import { environment } from "../../../../../environments/environment";
import { OnDestroy } from '@angular/core';


import { Client, DropDownViewModel, ClientSecurityList, AssignFromBaseViewModel, AssignOrUnassignViewModel, PermissionPrivilegeViewModel, AssignPermissionPrivilegeViewModel, SecurityRoleViewModel, SecurityRolePermissionViewModel, ClientSecurityRoleViewModel } from '../../../../model/ClientModel';
import { FileStorageModel } from '../../../../model/FileStorageModel';
import { ClientService } from '../client.service';
import { BindingService } from '../../../../services/binding.service'
import { NotifyService } from "app/services/notification.service";
import { ConfirmPopup } from "app/components/wrapper/confirm-popup";
import { DragulaService } from "ng2-dragula/ng2-dragula";
import { PanelBarItemModel } from "@progress/kendo-angular-layout/dist/es/panelbar/panelbar-item-model";
import { HardwareViewModel } from "app/model/ConfigurationModel";


@Component({
  selector: 'client-detail',
  templateUrl: './detail.component.html'
})
export class ClientDetailComponent implements OnInit, OnDestroy {
  public clientModel = new Client;
  public clientTypeData: Array<DropDownViewModel>;
  public countrySource: Array<DropDownViewModel> = [];
  public countryData: Array<DropDownViewModel>;
  public isDuplicateClient: any = null;
  public paramId: string;
  public buttonValue: string = "Submit";
  model: any = {};
  public showElement: boolean = true;
  public defaultItemCountry: DropDownViewModel = { Name: "Select Country", Id: null };
  public defaultItemClient: DropDownViewModel = { Name: "Select Client Type", Id: null };
  public defaultBaseClientRole: DropDownViewModel = { Name: "Select Base Client Role", Id: null };
  public clientValue: DropDownViewModel;
  public countryValue: DropDownViewModel;
  public isValid = true;

  public logoFile: FileStorageModel = new FileStorageModel();
  public uploadFileObj: FileStorageModel = null;
  public deletedFileObj: FileStorageModel = null;

  // Security Grid 
  public IsDisable: boolean = true;
  public IsSelected: boolean = false;
  private gridView: GridDataResult;
  private data: Object[];
  private pageSize: number = 10;
  private skip: number = 0;
  private items: Array<Object> = [];
  public multiple: boolean = false;
  public allowUnsort: boolean = true;
  private sort: SortDescriptor[] = [];
  public tab: string = "";
  // End Security Grid

  baseClientRole: any;
  baseClientRoleValue: any;
  // public dragDropList: AssignFromBaseViewModel;
  // public AssignList: Array<AssignOrUnassignViewModel> = [];
  // public UnassignList: Array<AssignOrUnassignViewModel> = [];
  public options: any = { removeOnSpill: true }

  // NewRole Grid
  public IsCreatePage: boolean = false;
  public newRoleGridView: any = [];
  public editRoleGridView: any = [];
  private newRoleGridPageSize: number = 10;
  private newRoleGridSkip: number = 0;
  public privilegColumns: Array<Object> = [];
  roleName: string = "";
  securityRoleId: string = null;
  // End NewRole Grid

  // Assignment Grid 
  filterDataSource: Array<DropDownViewModel> = [];
  filterText: Array<DropDownViewModel> = [];
  public newProfileGridView: any = [];
  public profileGridView: any = [];
  kgSkip: number = 0;
  kgSort: SortDescriptor[] = [];
  kgState: State = {};
  kgFilter: CompositeFilterDescriptor;
  checkBoxList: Array<string> = [];
  // End Assignemnet Grid

  constructor(private notifyService: NotifyService, private bindingService: BindingService, private clientService: ClientService, private route: ActivatedRoute, private router: Router, private _notify: NotifyService, private confirmPopup: ConfirmPopup, private dragulaService: DragulaService) {
    this.dragulaService.setOptions('bag-one', {
      copy: true
    });
  }

  ngOnDestroy() { this.dragulaService.destroy('bag-one'); }

  ngOnInit(): void {
    this.setCompositeFilters();
    this.route.params.subscribe(param => this.paramId = param["clientId"].toLowerCase());
    this.route.params.subscribe(param => this.tab = (param["tab"] != null) ? param["tab"].toLowerCase() : "");
    this.model.drpClientType = "0";
    this.bindingService.getClientType().subscribe(
      clientType => {
        this.clientTypeData = clientType.Result;
      });
    this.bindingService.getCountry().subscribe(
      country => {
        this.countrySource = country.Result;
        this.countryData = this.countrySource.slice();
      });
    if (this.paramId != "new") {
      this.IsDisable = false;
      this.showElement = false;
      this.buttonValue = "Save";
      this.clientService.getClientById(this.paramId).subscribe(
        response => {
          this.model = response.Result;
          let file = this.model.Logo;
          if (file)
            file.FileAccessUrl = environment.origin + 'Content/' + file.FileAccessUrl + '?' + Math.round(new Date().getTime() / 1000);
          this.logoFile = file;
          this.clientModel.DeactivationDate = new Date(response.Result.DeactivationDate);
          this.clientModel.ActivationDate = new Date(response.Result.ActivationDate);
          this.clientValue = { Name: response.Result.ClientType, Id: response.Result.ClientTypeId };
          this.countryValue = { Name: response.Result.Country, Id: response.Result.CountryId };
        });
      // this.clientService.GetAssignUnassignRole().subscribe(x => {
      //   this.dragDropList = <AssignFromBaseViewModel>x.Result;
      //   this.UnassignList = <Array<AssignOrUnassignViewModel>>this.dragDropList.Unassigned;
      //   this.dragDropList.AssignedToClient.forEach(element => {
      //     this.AssignList.push({ RoleId: element.RoleId, RoleName: element.RoleName, IsPeopleAssign: element.IsPeopleAssign });
      //   });
      // });


    }
    this.getSecurityList();
    // this.dragulaService.dropModel.subscribe((value) => {
    //   this.onDrop(value.slice(1));
    // });

  }


  protected verifyClientName(event: any) {
    if (event.target.value != "") {
      this.clientService.verifyClient(event.target.value, this.paramId).subscribe(res => {
        this.isDuplicateClient = res.Result;
      });
    }
    else
      this.isDuplicateClient = null;
  }

  protected save() {
    if (this.isDuplicateClient == true) {
      this._notify.error("Client Name already exist.");
      return;
    }
    if (this.model.Password != this.model.ConfirmPassword) {
      this._notify.error("Password mismatch");
      return;
    }

    var clientModel = new Client();
    clientModel = this.model;
    if (this.paramId == "new") {
      clientModel.Contact = this.model.FirstName + " " + this.model.LastName;
    }
    else {
      clientModel.ClientId = this.paramId;
    }
    // File upload ============
    clientModel.Logo = this.uploadFileObj || null;
    clientModel.DeletedLogo = this.deletedFileObj || null;
    // ============= File upload

    this.clientService.save(clientModel).subscribe(response => {
      let res: Array<Object> = [];
      res = <Array<Object>>response.Result;
      if (res[2] != null) {
        this.IsDisable = false;
        this.IsSelected = true;
        this.router.navigate(['/admin/setting/client/' + res[2].toString() + '/security']);
      }
      else {
        this.router.navigate(['/admin/setting/client']);
      }
      this._notify.success((this.paramId != "new") ? "Client added successfully." : "Client updated successfully.");
    });
  }

  protected onBaseClientRoleChange(value) {
    this.editRoleGridView = this.newRoleGridView.map(x => Object.assign({}, x));
    this.baseClientRoleValue = value;
    if (value.Id)
      this.clientService.GetBaseClientPermissionRoles(value.Id).subscribe(baseAssignedRoles => {
        this.setGridCheckBox(baseAssignedRoles.Result);
      });
  }

  protected saveRole() {
    let securityRoleModel = new SecurityRoleViewModel();
    let securityRolePermissionModel = new Array<SecurityRolePermissionViewModel>();
    let clientSecurityRole = new ClientSecurityRoleViewModel()

    securityRoleModel.ClientId = this.paramId;
    securityRoleModel.Name = this.roleName;
    securityRoleModel.SecurityRoleId = this.securityRoleId;
    securityRoleModel.BaseClientRoleId = this.baseClientRoleValue ? this.baseClientRoleValue.Id : null;

    this.editRoleGridView.forEach(role => {
      this.privilegColumns.forEach(privilege => {
        if (role[privilege["Name"]] == true) {
          securityRolePermissionModel.push({
            SecurityRoleId: securityRoleModel.SecurityRoleId,
            SecurityRolePermissionId: null,
            PermissionId: role["PermissionId"],
            PrivilegeId: privilege["PrivilegeId"]
          });
        }
      });
    });

    clientSecurityRole.SecurityRoleViewModel = securityRoleModel;
    clientSecurityRole.SecurityRolePermissionViewModel = securityRolePermissionModel;

    this.clientService.saveRole(clientSecurityRole).subscribe(response => {
      this._notify.success("Security Role saved successfully.");
      this.getSecurityList();
      this.IsCreatePage = false;
      this.resetSecurityTab();
    });
  }

  protected editHandler({ dataItem }) {
    this.IsCreatePage = true;
    this.clientService.getSecurityRole(dataItem.SecurityRoleId).subscribe((respose) => {
      let securityRoleObj: ClientSecurityRoleViewModel = respose.Result;
      this.roleName = securityRoleObj.SecurityRoleViewModel.Name;
      this.securityRoleId = securityRoleObj.SecurityRoleViewModel.SecurityRoleId;
      if (securityRoleObj.SecurityRoleViewModel.BaseClientRoleId) {
        this.baseClientRoleValue = this.baseClientRole.filter(x => {
          return x.Id == securityRoleObj.SecurityRoleViewModel.BaseClientRoleId
        })[0];
      }
      else {
        this.baseClientRoleValue = undefined;
      }
      this.setGridCheckBox(securityRoleObj.SecurityRolePermissionViewModel);
    })
  }

  protected setGridCheckBox(assignedPermission: Array<SecurityRolePermissionViewModel>) {
    assignedPermission.forEach(element => {
      let permission = this.editRoleGridView.filter((gridData: SecurityRolePermissionViewModel) => {
        return gridData.PermissionId == element.PermissionId;
      })[0];
      this.privilegColumns.forEach((privilege: any) => {
        if (privilege.PrivilegeId == element.PrivilegeId) {
          permission[privilege["Name"]] = true;
        }
      });
    });
  }

  protected changeClientInputStyle(): any {
    let color = '';
    if (this.isDuplicateClient == true)
      color = 'Red';
    else if (this.isDuplicateClient == false)
      color = 'Green';
    return { 'border-color': color };
  }

  // File upload ============
  protected onSelectFile(obj: FileStorageModel) {
    this.uploadFileObj = obj;
    if (this.model.LogoId && this.model.Logo)
      this.deletedFileObj = this.model.Logo;
  }

  protected onRemoveFile(obj: FileStorageModel) {
    if (this.model.LogoId && this.model.Logo)
      this.deletedFileObj = this.model.Logo;
    this.uploadFileObj = null;
  }
  // ============= File upload

  protected onCancleClick() {
    this.router.navigate(['/admin/settings/client']);
  }

  protected onConfirmKey(event: any) {
    this.isValid = (this.model.Password != undefined && (this.model.ConfirmPassword.toLowerCase() != this.model.Password.toLowerCase())) ? true : false;
  }

  protected onClientChange(value: any): void {
    this.model.ClientTypeId = value.Id;
  }

  protected onCountryChange(value: any): void {
    this.model.CountryId = value.Id;
  }

  protected countryFilterChange(filter: any): void {
    this.countryData = this.countrySource.filter((s) => s.Name.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
  }

  protected getSecurityList() {
    this.items = [];
    this.clientService.getSecurityAll(this.paramId).subscribe(response => {
      this.items = response.data;
      this.loadItems();
    });
  }

  protected pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadItems();
  }

  protected sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.loadItems();
  }

  protected loadItems(): void {
    this.gridView = {
      data: orderBy(this.items.slice(this.skip, this.skip + this.pageSize), this.sort),
      total: this.items.length
    };
  }

  protected securityRoleActivation(id: any, status: any) {
    this.confirmPopup.openConfirmation("Are you sure to <b>" + ((status) ? "de-activate" : "activate") + "</b> this person?")
      .then(res => {
        this.clientService.securityRoleActivation(id).subscribe(x => {
          this._notify.success("Security Role updated successfully.");
          this.getSecurityList();
        });
      }).catch();
  }

  protected removeHandler({ dataItem }) {
    if (dataItem.Users > 0) {
      this._notify.info("User is already assign !");
    }
    else {
      this.confirmPopup.openConfirmation("Are you sure to delete this security role?").then(res => {
        this.clientService.removeSecurityRole(dataItem.SecurityRoleId).subscribe(data => {
          this._notify.success("Security Role deleted successfully.");
          this.getSecurityList();
        });
      });
    }
  }

  // onDrop(args) {
  //   let isValid: boolean = false;
  //   let dragText = args[0].textContent;
  //   if (args[1].id == "Unassign" && args[2].id == "Assign") {
  //     this.dragDropList.AssignedToClient.forEach(element => {
  //       if (element.RoleName == dragText && element.IsPeopleAssign) {
  //         this.UnassignList = this.UnassignList.filter(x => x.RoleId != element.RoleId);
  //         isValid = true;
  //       }
  //     });
  //     if (isValid) {
  //       this._notify.error("Already User assign to this role !");
  //     }
  //     else {
  //       this.AssignList = this.AssignList.filter(element => element.RoleName != dragText);
  //     }
  //   }
  //   else if (args[2].id == "Unassign" && args[1].id == "Assign") {
  //     this.UnassignList = this.UnassignList.filter(element => element.RoleName != dragText);
  //   }
  // }

  // OnAssignRole() {
  //   this.dragDropList = new AssignFromBaseViewModel();
  //   this.dragDropList.Unassigned = this.UnassignList;
  //   this.dragDropList.AssignedToClient = [];
  //   this.AssignList.forEach(element => {
  //     this.dragDropList.AssignedToClient.push({ RoleId: element.RoleId, IsPeopleAssign: element.IsPeopleAssign, RoleName: element.RoleName });
  //   });
  //   this.clientService.AssignRole(this.dragDropList).subscribe(x => {
  //     if (x.Result) {
  //       this.getSecurityList();
  //       this._notify.success("Successfully Role Assign !");
  //     }
  //   });
  // }

  protected NewRoleGridData() {
    this.IsCreatePage = true;
  }

  protected resetSecurityTab() {
    this.editRoleGridView = this.newRoleGridView.map(x => Object.assign({}, x));
    this.roleName = "";
    this.securityRoleId = null;
    this.baseClientRoleValue = undefined;
  }

  protected newRolePageChange(event: PageChangeEvent): void {
    this.newRoleGridSkip = event.skip;
  }

  protected onTabSelected(event: any) {
    if (event.title == "Security") {
      this.privilegColumns = [];
      this.newRoleGridView = [];
      this.clientService.GetPermissionPrivilegeList().subscribe(x => {
        let tempObj = <AssignPermissionPrivilegeViewModel>x.Result;
        tempObj.Permission.forEach(element => {
          this.newRoleGridView.push({ Name: element.Name, PermissionId: element.RoleId, SystemCode: element.SystemCode })
        });
        this.privilegColumns.push({ Name: "Name", PrivilegeId: '' });
        tempObj.Privilege.forEach(element => {
          this.privilegColumns.push({ Name: element.Name, PrivilegeId: element.RoleId });
          this.newRoleGridView.forEach(ele => {
            ele[element.Name] = false;
          });
        });
        this.editRoleGridView = this.newRoleGridView.map(x => Object.assign({}, x));
      });
      this.bindingService.getBaseClientRole().subscribe(x => {
        this.baseClientRole = x.Result;
      });
    }
    else if (event.title == "Assignment") {
      this.IsSelected = true;
      this.filterDataSource = this.clientService.setProfileFilterDataSet();
      this.setCompositeFilters();
      this.model.ddlFilter = this.filterDataSource[0];
      this.refreshProfileGrid();
    }
  }

  protected setCompositeFilters() {
    this.kgFilter = { logic: "and", filters: [] };
    for (var i of this.filterDataSource) {
      this.kgFilter.filters.push({
        field: i.Id, operator: "c", value: null
      })
    }
  }

  protected profileStateChange(state: State) {
    this.kgState = state;
    this.refreshProfileGrid();
  }

  protected refreshProfileGrid() {
    this.profileGridView = [];
    this.newProfileGridView = [];
    this.kgState.filter = this.kgFilter;
    this.clientService.loadAllProfile(this.kgState).subscribe(element => {
      let tempObj = <Array<HardwareViewModel>>element.data;
      tempObj.forEach(element1 => {
        this.newProfileGridView.push(element1);
      });
    });
    this.profileGridView = this.newProfileGridView;
  }

  protected addFilter() {
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
    this.refreshProfileGrid();
  }

  protected onCancelClick(name: string): void {
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
      this.refreshProfileGrid();
    }
  }

  protected sortProfileChange(sort: SortDescriptor[]): void {
    this.kgSort = sort;
    this.profileGridView = orderBy(this.profileGridView, sort);
  }

  protected stateChange(state: State) {
    this.kgState = state;
  }
  // Button Click event  
  protected assignmentSave() {
    let dataList = <Array<HardwareViewModel>>this.profileGridView;
    dataList.forEach(element => {
      if (element.IsSelected) {
        this.checkBoxList.push(element.HardwareProfileId);
      }
    });
    this.clientService.updateProfile(this.checkBoxList).subscribe(x => {
      if (x.Result) {
        this.notifyService.success('hardware assignment updated successfully');
      }
    });
  }
}




