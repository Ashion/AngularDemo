import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayComponent } from "./display/display.component";
import { DetailComponent } from "./detail/detail.component";

const routes: Routes = [
    {
        path: '', component: null,
        children: [
            { path: '', component: DisplayComponent },
            { path: ':placeId', component: DetailComponent }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class RouteModule { }