import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayComponent } from "./display/display.component";
import { TypeComponent } from "./type/type.component";
import { PlaceComponent } from "./place/place.component";
import { TimepointComponent } from "./timepoint/timepoint.component";
import { AlertComponent } from "./alert/alert.component";
import { DetailComponent } from "./detail/detail.component";

const routes: Routes = [
    {
        path: '', component: null,
        children: [
            { path: '', component: DisplayComponent },
            { path: 'type', component: TypeComponent },
            { path: 'alert', component: AlertComponent },
            { path: 'place', component: PlaceComponent },
            { path: 'timepoint', component: TimepointComponent },
            { path: ':alertId', component: DetailComponent }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class RouteModule { }