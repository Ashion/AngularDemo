import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../../../environments/environment';
import { LoginModel } from '../../model/LoginModel';
import { LoginService } from './login.service';
import { SignalRService } from '../../services/signalr.service';

import { NotifyService } from '../../services/notification.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  loginmodel: LoginModel = { Password: '', RememberMe: false, UserNmae: '' };
  forgotUserName: string;
  loading = false;
  //returnUrl: string;
  subscriptions: Subscription[] = [];
  isForgotPassword: boolean = false;
  forgotSuccess: boolean = false;

  constructor(private router: Router, private LoginService: LoginService,
    private signalrService: SignalRService, private _notify: NotifyService,
    private commonService: CommonService) { }

  loginClick() {
    this.loading = true;
    if (!this.signalrService._connection) {
      this._notify.alert('Service not connected. Please reload page.');
      this.loading = false;
      return;
    }
    else
      this.subscriptions.push(this.LoginService.login(this.loginmodel).subscribe(authModel => {

        if (authModel.StatusCode == 200) {
          if (authModel.Result.ForcePasswordReset) {
            this.router.navigateByUrl('changepassword/' + authModel.Result.PeopleId);
            return;
          }
          this.signalrService._connection.invoke('AddClient', authModel.Result.Token).then((data: any) => {
            if (data.StatusCode == 200) {
              let tokenKey = authModel.Result.IsAustracker ? environment.adminTokenKey : environment.userTokenKey
              localStorage.setItem(tokenKey, authModel.Result.Token);
              let authUserObj = JSON.parse(data.Result)[0];// Object.assign({}, authModel.Result, JSON.parse(data.Result)[0]);
              this.commonService.setAuthUser(authUserObj);
              if (authUserObj.DefaultURL) {
                this.router.navigateByUrl(authUserObj.DefaultURL);
              }
              else if (authModel.Result.IsAustracker) {
                this.router.navigateByUrl('admin/settings/client');
              }
              else {
                this.router.navigate(['user/dashboard']);
              }
            }
            else {
              this._notify.error(data.ErrorMessage);
              this.loading = false;
            }
          });
        }
      },
        err => {
          this.loading = false;
        }));
  }

  forgotClick() {
    this.loading = true;
    this.subscriptions.push(this.LoginService.forgotPassword(this.forgotUserName).subscribe(res => {

      if (res.StatusCode == 200) {
        this.forgotUserName = '';
        this.loading = false;
        this.forgotSuccess = true;
        this._notify.success('Reset link sent.')
      }
    },
      err => {
        this.loading = false;
      }));
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach(s => s.unsubscribe());
    }
  }

}
