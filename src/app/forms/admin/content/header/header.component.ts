import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Router } from '@angular/router';
import { SignalRService } from '../../../../services/signalr.service';
import { CommonService } from '../../../../services/common.service';
import { NotifyService } from '../../../../services/notification.service';

import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { ChangepasswordComponent } from '../../../../components/wrapper/change-password-popup/changepassword.component';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'admin-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  userAlis: string = null;
  AuthUserObj: any;
  subscriptions: Subscription;
  LogoUrl: string = '';

  constructor(private signalrService: SignalRService, private _router: Router,
    private commonService: CommonService,
    private _notify: NotifyService, private modal: Modal) {
    this.AuthUserObj = this.commonService.AuthUser.getValue();
    this.userAlis = (this.AuthUserObj.FirstName.substring(0, 1) + this.AuthUserObj.LastName.substring(0, 1)).toUpperCase();
  }

  ngOnInit(): void {
    this.subscriptions = this.commonService.AuthUser.subscribe(userObj => {
      this.AuthUserObj = userObj;
      this.LogoUrl = userObj.LogoURL ? environment.origin + 'Content/' + userObj.LogoURL + '?' + Math.round(new Date().getTime() / 1000) : '';
    });
  }

  logoutClick() {
    if (!this.signalrService._connection) {
      this._notify.alert('Service not connected. Please reload page.');
      return;
    }
    this.signalrService._connection.invoke('RemoveClient').then((data: any) => {
      localStorage.removeItem(environment.adminTokenKey);
      localStorage.removeItem(environment.userTokenKey);
      this._router.navigate(['/login']);
    }, err => {

    });
  }

  changePasswordClick() {
    this.modal.open(ChangepasswordComponent, overlayConfigFactory({}, BSModalContext));
  }

  ngOnDestroy(): void {
    if (this.subscriptions)
      this.subscriptions.unsubscribe();
  }
}
