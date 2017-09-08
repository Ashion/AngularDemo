import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Router } from '@angular/router';
import { SignalRService } from '../../../../services/signalr.service';
import { CommonService } from '../../../../services/common.service';
import { NotifyService } from '../../../../services/notification.service';

import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { ChangepasswordComponent } from '../../../../components/wrapper/change-password-popup/changepassword.component';
import { AnnouncementPopupComponent } from "app/components/wrapper/announcement-popup/announcement-popup.component";
import { ScriptService } from "app/services/scripts.service";

@Component({
  selector: 'user-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  userAlis: string = null;
  clientLogoUrl: string = 'assets/images/trt-logo.png';
  LogoUrl: string = '';
  AuthUserObj: any;

  constructor(private signalrService: SignalRService, private _router: Router,
    private commonService: CommonService, private _notify: NotifyService, public modal: Modal,
    private _scriptService: ScriptService) {
    this.AuthUserObj = commonService.AuthUser.getValue();
    this.userAlis = (this.AuthUserObj.FirstName.substring(0, 1) + this.AuthUserObj.LastName.substring(0, 1)).toUpperCase();
  }

  ngOnInit() {
    this.commonService.AuthUser.subscribe(userObj => {
      this.AuthUserObj = userObj;
      this.LogoUrl = userObj.LogoURL ? environment.origin + 'Content/' + userObj.LogoURL + '?' + Math.round(new Date().getTime() / 1000) : '';
      this.clientLogoUrl = userObj.ClientLogoURL ? environment.origin + 'Content/' + userObj.ClientLogoURL + '?' + Math.round(new Date().getTime() / 1000) : this.clientLogoUrl;
    });

    // if (this.AuthUserObj.ClientLogoURL)
    //   this.clientLogoUrl = environment.origin + 'Content/' + this.AuthUserObj.ClientLogoURL + '?' + Math.round(new Date().getTime() / 1000);
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

  announcementClick() {
    this._scriptService.load('editor').then(data => {
      this.modal.open(AnnouncementPopupComponent, overlayConfigFactory({}, BSModalContext));
    });
  }

  changePasswordClick() {
    this.modal.open(ChangepasswordComponent, overlayConfigFactory({}, BSModalContext));
  }
}
