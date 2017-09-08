'use strict';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DisplayComponent } from './display/display.component';
import { DetailComponent } from './detail/detail.component';
import { ConfigurationService } from './configuration.service';

const routes: Routes = [
    {
        path: '', component: DisplayComponent
    },
    { path: ':hardwareProfile/:tab', component: DetailComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: [
        ConfigurationService
    ],
    exports: [RouterModule]
})

export class RouteModule { }