import { Injectable } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';

@Injectable()
export class NotifyService {
    public options = {
        position: ["bottom", "right"],
        timeOut: 1300,
        lastOnBottom: true,
        pauseOnHover: true,
        showProgressBar: true
    };

    constructor(private _service: NotificationsService) { }

    success(message, title = 'Success') {
        this._service.success(
            title,
            message,
            this.options
        )
    }

    alert(message, title = 'Alert') {
        this._service.alert(
            title,
            message,
            this.options
        )
    }

    error(message = "Sorry, something went wrong. Please try again.", title = 'Error') {
        this._service.error(
            title,
            message,
            this.options
        )
    }

    info(message, title = 'Information') {
        this._service.info(
            title,
            message,
            this.options
        )
    }

    warn(message, title = 'Warning') {
        this._service.warn(
            title,
            message,
            this.options
        )
    }
}