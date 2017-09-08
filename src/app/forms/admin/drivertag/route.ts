'use strict';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayComponent } from './display/display.component';
import { DetailComponent } from './detail/detail.component';
import { DrivertagService } from './drivertag.service';
const routes: Routes = [
    {
        path: '', component: DisplayComponent
    },
    { path: ':drivertagId', component: DetailComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: [
        DrivertagService
    ],
    exports: [RouterModule]
})

export class RouteModule { }