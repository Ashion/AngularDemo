import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { LayoutModule } from '@progress/kendo-angular-layout';

import { RouteModule } from './route';
import { DetailComponent } from './detail/detail.component';
import { DisplayComponent } from './display/display.component';
import { MapComponent } from './map/map.component';

import { PlaceService } from "./place.service";
import { MapService } from "../../../services/map.service";

import { DigitDecimalPipe, M2ToKm2Pipe } from "../../../shared/utility.pipe";

import { SharedModule } from "../../../shared/shared.module";

@NgModule({
    imports: [
        CommonModule,
        RouteModule,
        LayoutModule,
        FormsModule,
        SharedModule
    ],
    declarations: [
        DetailComponent,
        DisplayComponent,
        MapComponent,
        DigitDecimalPipe,
        M2ToKm2Pipe
    ],
    providers: [MapService, PlaceService]
})
export class PlacesModule { }