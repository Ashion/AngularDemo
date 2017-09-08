import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisplayComponent } from './display/display.component';
import { DetailComponent } from './detail/detail.component';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';
import { RouteModule } from './route';
import { PeopleService } from "./people.service";
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { SharedModule } from '../../../shared/shared.module';

import { NotifyService } from "../../../services/notification.service";
import { httpFactory } from "../../../interceptor/http.factory";

// import { UploadModule } from '@progress/kendo-angular-upload';
// import { UploadComponent } from '../../../components/wrapper/upload/upload.component';


@NgModule({
  imports: [
    CommonModule,
    RouteModule,
    FormsModule,
    GridModule,
    LayoutModule,
    DropDownsModule,
    SharedModule
  ],
  providers: [
    PeopleService
  ],
  declarations: [DisplayComponent, DetailComponent],
  exports: [DisplayComponent, DetailComponent]
})
export class PeopleModule { }
