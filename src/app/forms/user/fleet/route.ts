import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayComponent } from './display/display.component';
import { LogbookComponent } from './logbook/logbook.component';
import { FleetComponent } from './fleet.component';
import { ManageVehicleComponent } from './manage-vehicle/manage-vehicle.component';

const routes: Routes = [
    {
        path: '', component: null,
        children: [
            { path: '', component: DisplayComponent },
            {
                path: 'logbook', component: FleetComponent,
                children: [
                    { path: ':id', component: LogbookComponent }
                ]
            },
            {
                path: 'manage-vehicle', component: FleetComponent,
                children: [
                    { path: ':option/:id', component: ManageVehicleComponent }
                ]
            }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class RouteModule { }