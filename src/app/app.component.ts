import { Component, OnInit } from '@angular/core';
import { Router, Event as RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router'

import { SignalRService } from './services/signalr.service';
import { CommonService } from './services/common.service';
import { InItService } from './services/init.service';
import { NotifyService } from "app/services/notification.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

    title = 'Austracker';
    loading: boolean = true;
    appLoad: Boolean = false

    constructor(private router: Router, private signalrService: SignalRService,
        private _common: CommonService, private _notify: NotifyService) {
        router.events.subscribe((event: RouterEvent) => {
            this.navigationInterceptor(event);
        });
    }

    ngOnInit(): void {
        InItService.load().then(res => {
            this._common.setUserIP(res.ip)
            this.appLoad = true;
        });
    }

    // Shows and hides the loading spinner during RouterEvent changes
    navigationInterceptor(event: RouterEvent): void {
        // this.messages.push(JSON.stringify(event));
        if (event instanceof NavigationStart) {
            this.loading = true;
        }

        if (event instanceof NavigationEnd) {
            this.loading = false;
        }

        // Set loading state to false in both of the below events to hide the spinner in case a request fails
        if (event instanceof NavigationCancel) {
            this.loading = false;
        }

        if (event instanceof NavigationError) {
            this.loading = false;
        }
    }

}
