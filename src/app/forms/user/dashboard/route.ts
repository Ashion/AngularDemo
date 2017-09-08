import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

import { ItemdetailComponent } from './itemlist/itemdetail.component';
import { ItemdisplayComponent } from './itemlist/itemdisplay.component';

const routes: Routes = [
    {
        path: '', component: null,
        children: [
            { path: '', component: DashboardComponent },
            { path: 'itemlist', component: ItemdisplayComponent },
            { path: 'itemlist/detail', component: ItemdetailComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class RouteModule { }