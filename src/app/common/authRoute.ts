import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginService } from '../forms/login/login.service';
import { SignalRService } from '../services/signalr.service';
import { NotifyService } from '../services/notification.service';
import { CommonService } from '../services/common.service';

@Injectable()
export class AuthRoute implements CanActivate {
    constructor(private router: Router, private loginService: LoginService,
        private signalrService: SignalRService, private _notify: NotifyService,
        private commonService: CommonService) { }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let token: string = localStorage.getItem(environment.adminTokenKey) || localStorage.getItem(environment.userTokenKey);
        if (token) {
            if (this.signalrService._connection) {
                return this.addClient(token, route.routeConfig.path);
            }
            else {
                return this.signalrService.resolve().then((res) => {
                    return this.addClient(token, route.routeConfig.path);
                })
                //this._notify.info('SignalR not connected..');
            }
        }
        else {
            if (!this.signalrService._connection) {
                this.signalrService.resolve()
            }
            this.router.navigate(['/']);
            return false;
        }
    }

    private addClient(token, path) {
        return this.signalrService._connection.invoke('AddClient', token).then((data: any) => {
            if (data.StatusCode == 200) {
                let authUserObj = JSON.parse(data.Result)[0];
                this.commonService.setAuthUser(authUserObj);
                if (authUserObj.IsAustracker) {
                    if (path == 'admin')
                        return true;
                    else
                        this.router.navigateByUrl(authUserObj.DefaultURL || '/admin/setting/client');
                }
                else if (!authUserObj.IsAustracker) {
                    if (path == 'user')
                        return true;
                    else
                        this.router.navigateByUrl(data.Result.DefaultURL || '/user/dashboard');
                }

            }
            else {
                localStorage.removeItem(environment.adminTokenKey);
                localStorage.removeItem(environment.userTokenKey);
                this.signalrService._connection.invoke('RemoveClient');
                this._notify.error(data.ErrorMessage);
                return false;
            }
        });
    }
}