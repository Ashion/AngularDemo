import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DisplayComponent } from './display/display.component';
import { DetailComponent } from './detail/detail.component';
import { ModelService } from './model.service';

const routes: Routes = [
    {
        path: '', component: DisplayComponent
    },
    { path: ':modelId', component: DetailComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: [ModelService],
    exports: [RouterModule]
})

export class RouteModule { }