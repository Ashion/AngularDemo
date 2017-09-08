import { NgModule } from '@angular/core';
import { EqualValidator } from "./equal-validator.directive";
import { CommonModule } from '@angular/common';
import { UploadModule } from '@progress/kendo-angular-upload';
import { UploadComponent } from '../components/wrapper/upload/upload.component';
import { SlimScroll } from 'angular-io-slimscroll';
import { SecondToTimePipe, DateBackToTimePipe, DateToTimePipe, DtToTimezonePipe } from "app/shared/utility.pipe";
import { Md2Module } from 'md2';

@NgModule({
    imports: [CommonModule, UploadModule, Md2Module],
    declarations: [
        EqualValidator,
        UploadComponent,
        SlimScroll,
        SecondToTimePipe,
        DateBackToTimePipe,
        DateToTimePipe,
        DtToTimezonePipe
    ],
    exports: [EqualValidator, UploadComponent, SlimScroll,
        SecondToTimePipe, DateBackToTimePipe, DateToTimePipe, DtToTimezonePipe, Md2Module]
})

export class SharedModule { }
