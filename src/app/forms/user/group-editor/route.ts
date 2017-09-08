import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupEditorComponent } from './group-editor.component';
import { DriverListComponent } from './driver/driverlist.component';
import { DriverDetailComponent } from './driver/driverdetail.component';
import { GroupSettingComponent } from "app/forms/user/group-editor/group-setting/group-setting.component";
import { IndividualComponent } from "app/forms/user/group-editor/individual/individual.component";
import { IndividualListComponent } from "app/forms/user/group-editor/individual/individual.list.component";
import { VehicleComponent } from "app/forms/user/group-editor/vehicle/vehicle.component";
import { VehicleListComponent } from "app/forms/user/group-editor/vehicle/vehicle.list.component";
import { Groupcheck } from "app/forms/user/group-editor/groupcheck.service";

const routes: Routes = [
    {
        path: '', component: null,
        children: [
            {
                path: '', component: GroupEditorComponent,
                children: [
                    { path: 'editor', component: GroupSettingComponent },
                    { path: 'individual', component: IndividualListComponent, canActivate: [Groupcheck] },
                    { path: 'individual/:id', component: IndividualComponent, canActivate: [Groupcheck] },
                    { path: 'vehicle', component: VehicleListComponent, canActivate: [Groupcheck] },
                    { path: 'vehicle/:id', component: VehicleComponent, canActivate: [Groupcheck] },
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class RouteModule { } 