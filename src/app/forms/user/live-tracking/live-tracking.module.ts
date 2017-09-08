import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LiveTrackingComponent } from './live-tracking.component';
import { MapoverlayComponent } from './mapoverlay/mapoverlay.component';
import { GroupListComponent } from './group-list/group-list.component';

import { RouteModule } from './route';
import { FormsModule } from '@angular/forms';

import { MapService } from "app/services/map.service";
import { BindingService } from "app/services/binding.service";
import { LiveTrackingService } from "app/forms/user/live-tracking/live-tracking.service";
import { SharedModule } from "app/shared/shared.module";
import { GroupEditorService } from "app/forms/user/group-editor/group-editor.service";

@NgModule({
  imports: [
    RouteModule,
    FormsModule,
    CommonModule,
    SharedModule
  ],
  declarations: [
    MapoverlayComponent,
    GroupListComponent,
    LiveTrackingComponent
  ],
  providers: [
    MapService,
    BindingService,
    LiveTrackingService,
    GroupEditorService
  ]
})
export class LiveTrackingModule { }
