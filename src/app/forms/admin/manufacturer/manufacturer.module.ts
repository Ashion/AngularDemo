import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteModule } from './route';

import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { FormsModule } from '@angular/forms';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';

import { DisplayComponent } from './display/display.component';
import { DetailComponent } from './detail/detail.component';

@NgModule({
  imports: [
    CommonModule,
    RouteModule,
    GridModule,
    LayoutModule,
    FormsModule,
    DropDownsModule, ExcelModule
  ],
  declarations: [DisplayComponent, DetailComponent]
})
export class ManufacturerModule { }
