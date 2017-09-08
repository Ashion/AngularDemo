import { Injectable, OnInit } from '@angular/core';

import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { CommonService } from './common.service';

@Injectable()
export class InItService {
    private static promise;

    public static load() {
        // First time 'load' is called?
        if (!InItService.promise) {
            // Make promise to load
            InItService.promise = new Promise(resolve => {

                window['DisplayIP'] = (ev) => {
                    resolve(ev);
                };

                let node = document.createElement('script');
                node.src = "http://freegeoip.net/json/?callback=DisplayIP";
                node.type = 'text/javascript';
                document.getElementsByTagName('head')[0].appendChild(node);
            });
        }

        // Always return promise. When 'load' is called many times, the promise is already resolved.
        return InItService.promise;
    }
}