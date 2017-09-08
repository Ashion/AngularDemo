import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { PopoverModule } from 'app/components/wrapper/popover';
import { PlaceService } from 'app/forms/user/places/place.service';
import { BindingService } from 'app/services/binding.service';
import { MapService } from 'app/services/map.service';
import { SharedModule } from 'app/shared/shared.module';
import { DisplayComponent } from './display/display.component';
import { FleetComponent } from './fleet.component';
import { FleetService } from './fleet.service';
import { LogbookComponent } from './logbook/logbook.component';
import { MapkOverlayComponent } from './logbook/mapoverlay/mapoverlay.component';
import { TimescalebarComponent } from './logbook/timescalebar/timescalebar.component';
import { TriplistComponent } from './logbook/triplist/triplist.component';
import { ManageVehicleComponent } from './manage-vehicle/manage-vehicle.component';
import { VehicleLabelComponent } from './manage-vehicle/vehicle-label/vehicle-label.component';
import { NavigationComponent } from './navigation/navigation.component';
import { RouteModule } from './route';

@NgModule({
    imports: [
        CommonModule,
        RouteModule,
        FormsModule,
        GridModule,
        LayoutModule,
        DropDownsModule,
        DateInputsModule,
        InputsModule,
        SharedModule,
        PopoverModule
    ],
    declarations: [
        DisplayComponent,
        NavigationComponent,
        LogbookComponent,
        ManageVehicleComponent,
        MapkOverlayComponent,
        TimescalebarComponent,
        TriplistComponent,
        FleetComponent,
        VehicleLabelComponent
    ],
    providers: [FleetService, BindingService, MapService, PlaceService]
})
export class FleetModule { }