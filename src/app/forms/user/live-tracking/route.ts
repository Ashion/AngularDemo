import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LiveTrackingComponent } from './live-tracking.component';

const routes: Routes = [
    {
        path: '', component: null,
        children: [
            { path: '', component: LiveTrackingComponent },
            { path: ':trackingCord', component: LiveTrackingComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class RouteModule { }