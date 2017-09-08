import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrackingLogComponent } from './tracking-log.component';

const routes: Routes = [
    {
        path: '', component: TrackingLogComponent        
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],    
    exports: [RouterModule]
})

export class RouteModule { }