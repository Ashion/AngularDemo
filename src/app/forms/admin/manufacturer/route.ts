'use strict';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DisplayComponent } from './display/display.component';
import { DetailComponent } from './detail/detail.component';
import { ManufacturerService } from './manufacturer.service';

const routes: Routes = [
    {
        path: '', component: DisplayComponent
    },
    { path: ':manufacturerId', component: DetailComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: [
        ManufacturerService
    ],
    exports: [RouterModule]
})

export class RouteModule { }