import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';

import { RouteModule } from './route';
import { GroupEditorComponent } from './group-editor.component';
import { NavigationComponent } from './navigation/navigation.component';
import { DriverListComponent } from './driver/driverlist.component';
import { DriverDetailComponent } from './driver/driverdetail.component';
import { GroupSettingComponent } from './group-setting/group-setting.component';
import { IndividualComponent } from './individual/individual.component';
import { VehicleComponent } from './vehicle/vehicle.component';
import { IndividualListComponent } from "app/forms/user/group-editor/individual/individual.list.component";
import { VehicleListComponent } from "app/forms/user/group-editor/vehicle/vehicle.list.component";
import { GroupEditorService } from "app/forms/user/group-editor/group-editor.service";
import { BindingService } from "app/services/binding.service";
import { SharedModule } from "app/shared/shared.module";
import { Groupcheck } from "app/forms/user/group-editor/groupcheck.service";

@NgModule({
    imports: [
        CommonModule,
        RouteModule,
        FormsModule,
        DropDownsModule,
        GridModule,
        LayoutModule,
        SharedModule
    ],
    declarations: [
        GroupEditorComponent,
        NavigationComponent,
        DriverListComponent,
        DriverDetailComponent,
        GroupSettingComponent,
        IndividualComponent,
        IndividualListComponent,
        VehicleComponent,
        VehicleListComponent
    ],
    providers: [
        GroupEditorService,
        BindingService,
        Groupcheck
    ]
})
export class GroupEditorModule { } 