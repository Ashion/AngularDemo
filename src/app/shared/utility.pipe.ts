import * as moment from "moment";
import * as momentTz from "moment-timezone";
import { includes as _includes } from "lodash";
import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { dtToTimezone } from "app/shared/globals";

/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 |  exponentialStrength:10}}
 *   formats to: 1024
*/

// convert decimal value to fix digit value (default 4 digit - 25.2565)
@Pipe({ name: 'digitDecimal' })
export class DigitDecimalPipe implements PipeTransform {
    transform(value: number, exponent: number): number {
        return parseFloat(value.toFixed(isNaN(exponent) ? 4 : exponent));
    }
}

// convert meter square to km square
@Pipe({ name: 'm2ToKm2' })
export class M2ToKm2Pipe implements PipeTransform {
    transform(value: number): number {
        return parseFloat((value / 1000000).toFixed(4));
    }
}

// convert second to time like 3h 49m
@Pipe({ name: 'secondToTime' })
export class SecondToTimePipe implements PipeTransform {
    transform(totalSeconds: number, sortTime: boolean = false): string {
        if (totalSeconds == 0 || !totalSeconds)
            return 0 + 'm';
        var days = Math.floor(totalSeconds / (3600 * 24));
        var hours = Math.floor((totalSeconds - (days * (3600 * 24))) / 3600);
        var minutes = Math.floor((totalSeconds - (days * (3600 * 24)) - (hours * 3600)) / 60);
        var seconds = Math.floor(totalSeconds - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));
        let data = "";
        data = days != 0 ? days + "d " : data;
        data = hours != 0 ? data + hours + "h " : data;
        data = minutes != 0 ? data + minutes + "m " : data;
        if ((sortTime && days == 0) || !sortTime)
            data = seconds != 0 ? data + seconds + "s" : data;
        return data;
    }
}


// convert datetime format like (JUL 17, 2017, 3:17:39 PM / 3:17:39 PM) based on current time
@Pipe({ name: 'dateToTime' })
export class DateToTimePipe implements PipeTransform {

    constructor(public datePipe: DatePipe) { }

    transform(dt: any): string {

        // The number of milliseconds in one day
        var ONE_DAY = 1000 * 60 * 60 * 24;

        // Convert both dates to milliseconds
        var current_dt = new Date().getTime();
        var input_dt = new Date(dt).getTime();

        // Calculate the difference in milliseconds
        var difference_ms = Math.abs(current_dt - input_dt)

        // Convert back to days and return
        let days = Math.floor(difference_ms / ONE_DAY);
        if (days == 0)
            return this.datePipe.transform(dt, 'jm');

        return this.datePipe.transform(dt, 'yMMMd') + ", " + this.datePipe.transform(dt, 'jm');

    }
}

// convert date to time like a day ago, 2 hours ago, etc...
@Pipe({ name: 'dateBackToTime' })
export class DateBackToTimePipe implements PipeTransform {
    transform(dt: any, region: string): string {

        let currentDt = moment(dtToTimezone(moment.utc(), region));
        let lastUpdateDt = moment(dtToTimezone(dt, region));
        return moment(lastUpdateDt).from(currentDt);

        // // The number of milliseconds in one year/day/hr/min
        // var ONE_YR = 1000 * 60 * 60 * 24 * 365;
        // var ONE_DAY = 1000 * 60 * 60 * 24;
        // var ONE_HR = 1000 * 60 * 60;

        // // Convert both dates to milliseconds
        // var current_dt = new Date().getTime();
        // var input_dt = new Date(dt).getTime();

        // // Calculate the difference in milliseconds
        // var difference_ms = Math.abs(current_dt - input_dt)

        // // Convert back to years and return
        // let years = Math.floor(difference_ms / ONE_YR);
        // if (years > 1)
        //     return years + " years ago";
        // else if (years == 1)
        //     return "a year ago";

        // // Convert back to days and return
        // let days = Math.floor(difference_ms / ONE_DAY);
        // if (days > 1)
        //     return days + " days ago";
        // else if (days == 1)
        //     return "a day ago";

        // // Convert back to hours and return
        // let hrs = Math.floor(difference_ms / ONE_HR);
        // if (hrs > 1)
        //     return hrs + " hours ago";
        // else if (hrs == 1)
        //     return "an hour ago";

        // // Convert back to minutes and return
        // let mins = Math.floor(difference_ms / ONE_HR);
        // if (mins > 1)
        //     return mins + " minutes ago";
        // return "one minute ago";
    }
}

// convert datetime based on timezone
@Pipe({ name: 'dtToTimezone' })
export class DtToTimezonePipe implements PipeTransform {
    transform(dt: any, region: any): any {
        if (typeof (dt) == 'string' && !_includes(dt, 'Z'))
            dt = dt + 'Z';
        return momentTz.tz(dt, region || 'Australia/Sydney').format('MM/DD/YYYY h:mm:ss a');
    }
}

// bind dynamic HTML with bypassSecurityTrustHtml
@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
    constructor(private sanitized: DomSanitizer) { }
    transform(value) {
        return this.sanitized.bypassSecurityTrustHtml(value);
    }
}