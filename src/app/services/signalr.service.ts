import { SignalR, SignalRConnection } from 'ng2-signalr';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { DisplayAnnouncementModel } from "app/model/DashboardModel";

import { CommonService } from './common.service';
import { DashboardService } from "app/forms/user/dashboard/dashboard.service";


@Injectable()
export class SignalRService {
    public _connection: any;
    constructor(private _signalR: SignalR, private _common: CommonService,
        private _dashboardService: DashboardService) { }

    resolve() {
        if (!this._connection)
            return this._signalR.connect().then((res) => {
                this._connection = res;
                let clientListener = this._connection.listenFor('updateLogo');
                clientListener.subscribe((res) => {

                    let userObj = Object.assign({}, this._common.AuthUser.getValue(), {
                        ClientLogoURL: 'Client/' + res
                    });
                    this._common.setAuthUser(userObj);
                });

                let peopleListener = this._connection.listenFor('updateDetails');
                peopleListener.subscribe((res) => {
                    let userObj = Object.assign({}, this._common.AuthUser.getValue(), {
                        FirstName: res.FirstName,
                        LastName: res.LastName,
                        LogoURL: res.LogoURL
                    });
                    this._common.setAuthUser(userObj);
                });

                let announcementListener = this._connection.listenFor('updateAnnouncement');
                announcementListener.subscribe((res) => {
                    this._dashboardService.setNewAnnouncement(res);
                });
                return true;
            });
    }
}