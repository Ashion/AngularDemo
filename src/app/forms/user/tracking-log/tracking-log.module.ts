import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouteModule } from './route';
import { TrackingLogComponent } from './tracking-log.component';
import { TimelineBarComponent } from './timeline-bar/timeline-bar.component';
import { TrackingLogService } from './tracking-log.service';

import { InputsModule } from '@progress/kendo-angular-inputs';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';

// vis timeline module
import { VisTimelineDirective, VisTimelineService } from 'ng2-vis';
import { BindingService } from "app/services/binding.service";
import { SecondToTimePipe } from "app/shared/utility.pipe";

@NgModule({
    imports: [
        CommonModule,
        RouteModule,
        DateInputsModule,
        InputsModule,
        FormsModule
    ],
    declarations: [
        TrackingLogComponent,
        TimelineBarComponent,
        VisTimelineDirective
    ],
    providers: [
        VisTimelineService,
        TrackingLogService,
        BindingService
    ]
})
export class TrackingLogModule { }