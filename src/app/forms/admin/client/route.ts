'use strict';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClientDisplayComponent } from './display/display.component';
import { ClientDetailComponent } from './detail/detail.component';
import { ClientService } from './client.service';

const routes: Routes = [
    {
        path: '', component: ClientDisplayComponent
    },
    { path: ':clientId/:tab', component: ClientDetailComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: [
        ClientService
    ],
    exports: [RouterModule]
})

export class RouteModule { }