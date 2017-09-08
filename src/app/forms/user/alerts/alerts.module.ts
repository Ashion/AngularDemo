import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopoverModule } from 'app/components/wrapper/popover';
import { TrackingLogService } from 'app/forms/user/tracking-log/tracking-log.service';
import { SharedModule } from 'app/shared/shared.module';
import { AlertComponent } from './alert/alert.component';
import { AlertService } from './alerts.service';
import { DetailComponent } from './detail/detail.component';
import { DisplayComponent } from './display/display.component';
import { PlaceComponent } from './place/place.component';
import { RouteModule } from './route';
import { TimepointComponent } from './timepoint/timepoint.component';
import { TypeComponent } from './type/type.component';

@NgModule({
    imports: [
        CommonModule,
        RouteModule,
        LayoutModule,
        FormsModule,
        DropDownsModule,
        PopoverModule,
        SharedModule,
        GridModule
    ],
    declarations: [
        DetailComponent,
        DisplayComponent,
        TypeComponent,
        PlaceComponent,
        TimepointComponent,
        AlertComponent
    ],
    providers: [AlertService, TrackingLogService]
})
export class AlertsModule { }