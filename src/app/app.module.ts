import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// toast notification
import { SimpleNotificationsModule } from 'angular2-notifications';

// Modal popup
import {
  ModalModule, OverlayRenderer, DOMOverlayRenderer, Overlay
} from 'angular2-modal';
import { Modal, BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';

// html editor
import { CKEditorModule } from 'ng2-ckeditor';

// app libraries
import { httpFactory } from "./interceptor/http.factory";

// app level routes
import { AppRouteModule } from './app-route';

// main app component
import { AppComponent } from './app.component';

// login interface
import { LoginComponent } from './forms/login/login.component';
import { ResetPasswordComponent } from './forms/login/resetpassword/resetpassword.component';

// end-user interface
import { HeaderComponent as UserHeaderComponent } from './forms/user/content/header/header.component';
import { FooterComponent as UserFooterComponent } from './forms/user/content/footer/footer.component';
import { ContentComponent as UserContentComponent } from './forms/user/content/content.component';
import { ContentComponent as AdminContentComponent } from './forms/admin/content/content.component';
import { HeaderComponent as AdminHeaderComponent } from './forms/admin/content/header/header.component';
import { FooterComponent as AdminFooterComponent } from './forms/admin/content/footer/footer.component';
import { NavigationComponent as AdminNavigationComponent } from './forms/admin/content/navigation/navigation.component';

import { SignalRModule, SignalRConfiguration, SignalR, SignalRConnection } from 'ng2-signalr';
import { LoginService } from "app/forms/login/login.service";
import { SignalRService } from './services/signalr.service';
import { NotifyService } from './services/notification.service';
import { CommonService } from './services/common.service';
import { InItService } from './services/init.service';
import { SkipLogin } from './common/skiplogin';
import { AuthRoute } from './common/authRoute';
import { environment } from '../environments/environment';

import { NotfoundComponent } from './components/wrapper/not-found-page/notfound.component';
import { ChangepasswordComponent } from './components/wrapper/change-password-popup/changepassword.component';

import { ConfirmPopup } from './components/wrapper/confirm-popup';
import { SharedModule } from './shared/shared.module';
import { ForceChangePasswordComponent } from './forms/login/forcechangepassword/force-change-password.component';
import { AnnouncementPopupComponent } from './components/wrapper/announcement-popup/announcement-popup.component';
import { DashboardService } from "app/forms/user/dashboard/dashboard.service";
import { ScriptService } from "app/services/scripts.service";
import { AnnouncementComponent } from "app/forms/admin/announcement/announcement.component";

export function createConfig(): SignalRConfiguration {
  let browserId = localStorage.getItem("browserId");
  if (!browserId) {
    browserId = Math.random().toString(36).substr(2, 11);
    localStorage.setItem("browserId", browserId)
  }

  const c = new SignalRConfiguration();
  c.hubName = 'userhub';
  c.url = environment.origin;
  c.logging = false;
  c.qs = { browserId: browserId };
  return c;
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ResetPasswordComponent,
    UserHeaderComponent,
    UserFooterComponent,
    UserContentComponent,
    AdminHeaderComponent,
    AdminFooterComponent,
    AdminContentComponent,
    AnnouncementComponent,
    AdminNavigationComponent,
    NotfoundComponent,
    ChangepasswordComponent,
    ForceChangePasswordComponent,
    AnnouncementPopupComponent
  ],
  imports: [
    SharedModule,
    AppRouteModule,
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
    SignalRModule.forRoot(createConfig),
    FormsModule,
    ReactiveFormsModule,
    SimpleNotificationsModule.forRoot(),
    ModalModule.forRoot(),
    BootstrapModalModule,
    CKEditorModule
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: Http,
      useFactory: httpFactory,
      deps: [XHRBackend, RequestOptions, Router, NotifyService, CommonService]
    },
    { provide: APP_BASE_HREF, useValue: environment.baseURL },
    Modal,
    LoginService,
    SignalRService,
    SkipLogin,
    AuthRoute,
    NotifyService,
    CommonService,
    ConfirmPopup,
    InItService,
    DashboardService,
    ScriptService
  ],
  entryComponents: [ChangepasswordComponent, AnnouncementPopupComponent]
})

export class AppModule { }
