import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteModule } from './route';

import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { FormsModule } from '@angular/forms';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';


import { DisplayComponent } from './display/display.component';
import { DetailComponent } from './detail/detail.component';
import { DeviceService } from "app/forms/admin/device/device.service";
import { BindingService } from "app/services/binding.service";
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  imports: [
    CommonModule,
    RouteModule,
    GridModule,
    LayoutModule,
    FormsModule,
    DropDownsModule,
    DateInputsModule,
    ColorPickerModule
  ],
  providers: [
    DeviceService,
    BindingService
  ],
  declarations: [DisplayComponent, DetailComponent]
})
export class DeviceModule { }
