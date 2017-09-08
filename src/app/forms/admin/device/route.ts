import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DisplayComponent } from './display/display.component';
import { DetailComponent } from './detail/detail.component';
import { DeviceService } from './device.service';
import { BindingService } from "app/services/binding.service";

const routes: Routes = [
    {
        path: '', component: DisplayComponent
    },
    { path: ':deviceId', component: DetailComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: [DeviceService, BindingService],
    exports: [RouterModule]
})

export class RouteModule { }