import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteModule } from './route';
import { FormsModule } from '@angular/forms';

// KENDO
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
//

import { DisplayComponent } from './display/display.component';
import { DetailComponent } from './detail/detail.component';

@NgModule({
  imports: [
    CommonModule,
    RouteModule,
    FormsModule,
    DropDownsModule,
    GridModule,
    LayoutModule
  ],
  declarations: [DisplayComponent, DetailComponent]
})
export class ConfigurationModule { }
