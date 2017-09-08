import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './forms/login/login.component';
import { ResetPasswordComponent } from './forms/login/resetpassword/resetpassword.component';
import { ForceChangePasswordComponent } from './forms/login/forcechangepassword/force-change-password.component';
import { NotfoundComponent } from './components/wrapper/not-found-page/notfound.component';
import { ContentComponent as UserContentComponent } from './forms/user/content/content.component';
import { ContentComponent as AdminContentComponent } from './forms/admin/content/content.component';
import { AnnouncementComponent } from "app/forms/admin/announcement/announcement.component";
import { SkipLogin } from './common/skiplogin';
import { AuthRoute } from './common/authRoute';

const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate: [SkipLogin] },
    { path: 'resetpassword/:cacheKey', component: ResetPasswordComponent },
    { path: 'changepassword/:id', component: ForceChangePasswordComponent },
    {
        path: 'user', component: UserContentComponent, canActivate: [AuthRoute],
        children: [
            {
                path: 'dashboard',
                loadChildren: './forms/user/dashboard/dashboard.module.ts#DashboardModule'
            },
            {
                path: 'group-editor',
                loadChildren: './forms/user/group-editor/group-editor.module.ts#GroupEditorModule'
            },
            {
                path: 'fleet',
                loadChildren: './forms/user/fleet/fleet.module.ts#FleetModule'
            },
            {
                path: 'places',
                loadChildren: './forms/user/places/places.module.ts#PlacesModule'
            },
            {
                path: 'tracking-log',
                loadChildren: './forms/user/tracking-log/tracking-log.module.ts#TrackingLogModule'
            },
            {
                path: 'live-tracking',
                loadChildren: './forms/user/live-tracking/live-tracking.module.ts#LiveTrackingModule'
            },
            {
                path: 'people',
                loadChildren: './forms/user/people/people.module.ts#PeopleModule'
            },
            {
                path: 'export',
                loadChildren: './forms/user/export/export.module.ts#ExportModule'
            },
            {
                path: 'alerts',
                loadChildren: './forms/user/alerts/alerts.module.ts#AlertsModule'
            }
        ]
    },
    {
        path: 'admin', component: AdminContentComponent, canActivate: [AuthRoute],
        children: [
            {
                path: '',
                redirectTo: 'settings', pathMatch: 'full'
            },
            {
                path: 'settings', component: null,
                children: [
                    {
                        path: '',
                        redirectTo: 'client', pathMatch: 'full'
                    },
                    {
                        path: 'client',
                        loadChildren: './forms/admin/client/client.module.ts#ClientModule'
                    },
                    {
                        path: 'configuration',
                        loadChildren: './forms/admin/configuration/configuration.module.ts#ConfigurationModule'
                    },
                    {
                        path: 'announcement',
                        component: AnnouncementComponent
                    }
                ]
            },
            {
                path: 'tools', component: null,
                children: [
                    {
                        path: '',
                        redirectTo: 'device', pathMatch: 'full'
                    },
                    {
                        path: 'device',
                        loadChildren: './forms/admin/device/device.module.ts#DeviceModule'
                    },
                    {
                        path: 'model',
                        loadChildren: './forms/admin/model/model.module.ts#ModelModule'
                    },
                    {
                        path: 'manufacturer',
                        loadChildren: './forms/admin/manufacturer/manufacturer.module.ts#ManufacturerModule'
                    },
                    {
                        path: 'drivertag',
                        loadChildren: './forms/admin/drivertag/drivertag.module.ts#DrivertagModule'
                    }
                ]
            }
        ]
    },
    {
        component: NotfoundComponent,
        path: "404",
    },
    {
        path: "**",
        redirectTo: '404'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRouteModule {
}