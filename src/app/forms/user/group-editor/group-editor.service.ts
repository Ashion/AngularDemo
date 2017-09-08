import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { ApiResponseModel } from "../../../model/ApiResponseModel";

import 'rxjs/add/operator/map';
import { ClientGroup, GroupVehicle } from "app/model/ClientGroupModel";

@Injectable()
export class GroupEditorService {
    Http: Http;
    constructor(_http: Http) {
        this.Http = _http;
    }

    getGroupList(clientId: string) {
        return this.Http.get('/private/clientgroup/getclientgrouplist?clientId=' + clientId)
            .map(response => response.json());
    }

    getGroupById(groupId: string) {
        return this.Http.get('/private/clientgroup/getgroupbyid?groupId=' + groupId)
            .map(response => response.json());
    }

    getgroupvehiclelist() {
        return this.Http.get('/private/clientgroup/getgroupvehiclelist')
            .map(response => response.json());
    }

    verifyGroupName(groupName: string, groupId: string = 'new') {
        return this.Http.get('/private/clientgroup/verifygroupname',
            { params: { groupName: groupName, groupId: groupId } })
            .map(response => response.json());
    }

    saveClientGroup(groupModel: ClientGroup) {
        return this.Http.post('private/clientgroup/saveclientgroup', groupModel)
            .map(response => response.json());
    }

    getIndividuals(groupId: string) {
        return this.Http.get('/private/clientgroup/getindividuals?groupId=' + groupId)
            .map(response => response.json());
    }

    getVehicles(groupId: string) {
        return this.Http.get('/private/clientgroup/getvehicles?groupId=' + groupId)
            .map(response => response.json());
    }

    saveGroupVehicle(vehicleModel: GroupVehicle) {
        return this.Http.post('private/clientgroup/savegroupvehicle', vehicleModel)
            .map(response => response.json());
    }
}