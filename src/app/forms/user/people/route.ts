'use strict';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayComponent } from './display/display.component';
import { DetailComponent } from './detail/detail.component';
import { PeopleService } from './people.service';


const routes: Routes = [
    {
        path: '', component: null,
        children: [
            { path: '', component: DisplayComponent },
            { path: ':clientId', component: DetailComponent }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: [
        PeopleService
    ],
    exports: [RouterModule]
})

export class RouteModule { }