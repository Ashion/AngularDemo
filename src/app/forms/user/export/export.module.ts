import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ExportComponent } from './export.component';
import { RouteModule } from "app/forms/user/export/route";
import { ExportLogbookComponent } from './export-logbook/export-logbook.component';
import { ExportActivityComponent } from './export-activity/export-activity.component';
import { ExportOdometerComponent } from './export-odometer/export-odometer.component';
import { TrackingLogService } from "app/forms/user/tracking-log/tracking-log.service";
import { SharedModule } from "app/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    RouteModule,
    SharedModule,
    FormsModule
  ],
  providers: [TrackingLogService],
  declarations: [
    ExportComponent,
    ExportLogbookComponent,
    ExportActivityComponent,
    ExportOdometerComponent
  ]
})
export class ExportModule { }
