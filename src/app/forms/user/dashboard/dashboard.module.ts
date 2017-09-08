import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { RouteModule } from './route';


import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';


import { DashboardComponent } from './dashboard.component';
import { ItemdisplayComponent } from './itemlist/itemdisplay.component';
import { ItemdetailComponent } from './itemlist/itemdetail.component';
import { AnnouncementsComponent } from './announcements/announcements.component';
import { GroupComponent } from './group/group.component';
import { LastloginComponent } from './lastlogin/lastlogin.component';
import { RecentalertsComponent } from './recentalerts/recentalerts.component';
import { WidgetsComponent } from './widgets/widgets.component';
import { GroupEditorService } from "app/forms/user/group-editor/group-editor.service";
import { PeopleService } from "app/forms/user/people/people.service";
import { SharedModule } from '../../../shared/shared.module';
import { SafeHtmlPipe } from "app/shared/utility.pipe";

@NgModule({
    imports: [
        CommonModule,
        RouteModule,
        FormsModule,
        SharedModule,
        GridModule,
        LayoutModule,
        DropDownsModule
    ],
    declarations: [
        AnnouncementsComponent,
        DashboardComponent,
        GroupComponent,
        LastloginComponent,
        RecentalertsComponent,
        WidgetsComponent,
        SafeHtmlPipe,
        ItemdetailComponent,
        ItemdisplayComponent
    ],
    providers: [
        GroupEditorService,
        PeopleService
    ]
})
export class DashboardModule { }