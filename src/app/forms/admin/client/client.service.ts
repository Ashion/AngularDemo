import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, toODataString, toDataSourceRequestString } from '@progress/kendo-data-query';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ApiResponseModel } from "../../../model/ApiResponseModel";
import { Client, DropDownViewModel, AssignFromBaseViewModel, SecurityRoleViewModel, SecurityRolePermissionViewModel, ClientSecurityRoleViewModel } from "../../../model/ClientModel";


import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HardwareProfile } from "app/model/ConfigurationModel";

@Injectable()
export class ClientService {
    http: Http;
    allData: Client[] = new Array<Client>();
    allData$: BehaviorSubject<Client[]>;

    allDataProfile: HardwareProfile[] = new Array<HardwareProfile>();
    allDataProfile$: BehaviorSubject<HardwareProfile[]>;

    constructor(_http: Http) {
        this.http = _http;
        this.allData$ = <BehaviorSubject<Client[]>>new BehaviorSubject(new Array<Client>());
        this.allDataProfile$ = <BehaviorSubject<HardwareProfile[]>>new BehaviorSubject(new Array<HardwareProfile>());
    }

    setFilterDataSet() {
        var listItems: Array<DropDownViewModel> = [];
        listItems.push({ Id: "All", Name: "All" });
        listItems.push({ Id: "Name", Name: "Client Name" });
        listItems.push({ Id: "Contact", Name: "Contact" });
        listItems.push({ Id: "Website", Name: "Website" });
        listItems.push({ Id: "ClientTypeName", Name: "Client Type" });
        listItems.push({ Id: "EmailAddress", Name: "Email" });
        listItems.push({ Id: "PhoneNumber", Name: "Phone" });
        return listItems;
    }

    loadAll(state: State) {
        const queryStr = `${toDataSourceRequestString(state)}`;
        return this.http.get(`private/client/getall?${queryStr}`)
            .map(response => {
                let res = response.json();
                return (<GridDataResult>{
                    data: res.Result.Data,
                    total: res.Result.Total
                })
            })
            .subscribe((data: any) => {
                this.allData = data;
                this.allData$.next(data);
            });
    }

    remove(clientId: string) {
        return this.http.get(`private/client/delete?id=${clientId}`)
            .map(respose => respose.json());
    }

    save(client: Client): Observable<ApiResponseModel> {
        return this.http.post('private/client/save', client)
            .map(response => response.json());
    }

    saveRole(clientSecurityRole: ClientSecurityRoleViewModel): Observable<ApiResponseModel> {
        return this.http.post('private/client/saveRole', clientSecurityRole)
            .map(response => response.json());
    }

    getSecurityRole(securityRoleId: string): Observable<ApiResponseModel> {
        return this.http.get('private/client/getsecurityrole/' + securityRoleId)
            .map(response => response.json());
    }

    verifyClient(name: string, clientId: string): Observable<ApiResponseModel> {
        return this.http.get('private/client/verifyclient', { params: { name: name, id: clientId } })
            .map(response => response.json());
    }

    getClientById(Id: string): Observable<ApiResponseModel> {
        return this.http.get(`private/client/getbyid?id=${Id}`)
            .map(response => response.json());
    }

    getSecurityAll(Id: string) {
        return this.http.get(`private/client/getsecurityall?id=${Id}`)
            .map(response => {
                let res = response.json();
                return (<GridDataResult>{
                    data: res.Result,
                    total: res.Result.length
                })
            });
    }

    subscribeToDataService(): Observable<Client[]> {
        return this.allData$.asObservable();
    }

    securityRoleActivation(id: any) {
        return this.http.get(`${'/private/client/activeinactiverole'}/${id}`)
            .map(respose => respose.json());
    }

    removeSecurityRole(securityId: string) {
        return this.http.get(`private/client/deleterole?id=${securityId}`)
            .map(respose => respose.json());
    }

    GetAssignUnassignRole() {
        return this.http.get(`${'/private/client/assignunassignrolelist'}`)
            .map(respose => respose.json());
    }

    AssignRole(data: AssignFromBaseViewModel) {
        return this.http.post(`${'/private/client/assignunassignrole'}`, data).map(respose => respose.json());
    }

    GetPermissionPrivilegeList() {
        return this.http.get(`${'/private/client/permissionprivilegelist'}`)
            .map(response => response.json());
    }

    GetBaseClientPermissionRoles(baseClintRoleId) {
        return this.http.get(`/private/client/getbaseclientpermissionroles/${baseClintRoleId}`)
            .map(response => response.json());
    }



    // Assignment Grid services 
    loadAllProfile(state: State) {
        const queryStr = `${toDataSourceRequestString(state)}`;
        return this.http.get(`private/configuration/getallforclient?${queryStr}`)
            .map(response => {
                let res = response.json();
                return (<GridDataResult>{
                    data: res.Result.Data,
                    total: res.Result.Total
                })
            });
    }
    subscribeToProfileDataService(): Observable<HardwareProfile[]> {
        return this.allDataProfile$.asObservable();
    }


    setProfileFilterDataSet() {
        var listItems: Array<DropDownViewModel> = [];
        listItems.push({ Id: "All", Name: "All" });
        listItems.push({ Id: "ProfileName", Name: "Profile Name" });
        listItems.push({ Id: "ProtocolName", Name: "Protocol" });
        listItems.push({ Id: "PortNumber", Name: "Port" });
        listItems.push({ Id: "ParserName", Name: "Parser" });
        listItems.push({ Id: "Description", Name: "Description" });
        return listItems;
    }


    updateProfile(profileId: any) {
        return this.http.post(`/private/configuration/updateprofile`, profileId)
            .map(response => response.json());
    }
    // End Assignemnt grid
}

