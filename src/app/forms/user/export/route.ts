import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExportComponent } from './export.component';
import { ExportLogbookComponent } from "app/forms/user/export/export-logbook/export-logbook.component";
import { ExportActivityComponent } from "app/forms/user/export/export-activity/export-activity.component";
import { ExportOdometerComponent } from "app/forms/user/export/export-odometer/export-odometer.component";


const routes: Routes = [
    {
        path: '', component: null,
        children: [
            { path: '', component: ExportComponent },
            { path: 'logbook', component: ExportLogbookComponent },
            { path: 'daily-activity', component: ExportActivityComponent },
            { path: 'odometer', component: ExportOdometerComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class RouteModule { }