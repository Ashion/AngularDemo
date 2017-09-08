import { Component, OnInit } from '@angular/core';
import { MapService } from "app/services/map.service";

@Component({
    selector: 'live-tracking',
    templateUrl: 'live-tracking.component.html'
})

export class LiveTrackingComponent implements OnInit {
    mapReady: boolean = false;
    constructor() { }

    ngOnInit() {
        MapService.load().then(res => {
            this.mapReady = true;
        });
    }
}