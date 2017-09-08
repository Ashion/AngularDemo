import { NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { GridModule } from '@progress/kendo-angular-grid';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { Ng2PaginationModule } from 'ng2-pagination';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import { RouteModule } from './route';
import { ClientDisplayComponent } from './display/display.component';
import { ClientDetailComponent } from './detail/detail.component';

import { ClientService } from './client.service';
import { NotifyService } from '../../../services/notification.service';
import { BindingService } from '../../../services/binding.service';
import { EqualValidator } from '../../../shared/equal-validator.directive';

import { SharedModule } from "../../../shared/shared.module";

@NgModule({
    imports: [
        CommonModule,
        RouteModule,
        GridModule,
        DropDownsModule,
        Ng2PaginationModule,
        LayoutModule,
        DateInputsModule,
        InputsModule,
        FormsModule,
        SharedModule,
        DragulaModule
    ],
    providers: [
        ClientService,
        BindingService
    ],
    declarations: [
        ClientDisplayComponent,
        ClientDetailComponent,
    ]
})
export class ClientModule { }