import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteModule } from './route';

import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { FormsModule } from '@angular/forms';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';

import { DisplayComponent } from './display/display.component';
import { DetailComponent } from './detail/detail.component';
import { BindingService } from "app/services/binding.service";


import { SharedModule } from "../../../shared/shared.module";
import { ModelService } from "app/forms/admin/model/model.service";
@NgModule({
  imports: [CommonModule, RouteModule, GridModule, LayoutModule, FormsModule, DropDownsModule, SharedModule],
  providers: [
    ModelService,
    BindingService
  ],
  declarations: [DisplayComponent, DetailComponent]
})
export class ModelModule { }
