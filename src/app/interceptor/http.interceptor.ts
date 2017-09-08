import { Injectable } from "@angular/core";
import { ConnectionBackend, RequestOptions, Request, RequestOptionsArgs, Response, Http, Headers } from "@angular/http";
import { Router } from '@angular/router';
import { Observable } from "rxjs/Rx";
import { environment } from "../../environments/environment";

@Injectable()
export class InterceptedHttp extends Http {

    browserList = {
        opera: 'Opera', chrome: 'Chrome', safari: 'Safari',
        firefox: 'Firefox', ie: 'IE', edge: 'Edge', unknown: 'Unknown'
    }

    constructor(
        private backend: ConnectionBackend,
        private defaultOptions: RequestOptions,
        private _router: Router,
        private notifyService,
        private commonService
    ) {
        super(backend, defaultOptions);
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        url = this.updateUrl(url);
        return this.intercept(super.get(url, this.getRequestOptionArgs(options, url)));
    }

    post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        url = this.updateUrl(url);
        return this.intercept(super.post(url, body, this.getRequestOptionArgs(options)));
    }

    put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        url = this.updateUrl(url);
        return this.intercept(super.put(url, body, this.getRequestOptionArgs(options)));
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        url = this.updateUrl(url);
        return this.intercept(super.delete(url, this.getRequestOptionArgs(options)));
    }

    private updateUrl(req: string) {
        if (req.indexOf('http://') == -1)
            return environment.origin + req;
        else
            return req;
    }

    private getRequestOptionArgs(options?: RequestOptionsArgs, url = null): RequestOptionsArgs {
        let browserName = this.getBrowserName();

        if (options == null) {
            options = new RequestOptions();
        }
        if (options.headers == null) {
            options.headers = new Headers();
        }

        // Set to true if api call for google map
        let isGoogleAPI = false;
        if (url && url.indexOf('maps.googleapis.com') != -1)
            isGoogleAPI = true;

        if (!isGoogleAPI) {
            options.headers.append('Content-Type', 'application/json');
            options.headers.append('Access-Control-Allow-Headers', '*');
            if (localStorage.getItem(environment.adminTokenKey) || localStorage.getItem(environment.userTokenKey))
                options.headers.append('Authorization', 'Bearer ' + (localStorage.getItem(environment.adminTokenKey) || localStorage.getItem(environment.userTokenKey)));
            options.headers.append('Access-Control-Allow-Origin', '*');
            options.headers.append('X-Forwarded-For', this.commonService.userIp);

            if (browserName == this.browserList.ie) {
                options.headers.append('cacheSeconds', '0');
                options.headers.append('useExpiresHeader', 'true');
                options.headers.append('useCacheControlHeader', 'true');
                options.headers.append('useCacheControlNoStore', 'true');
                options.headers.append('Expires', 'Mon, 23 Aug 1982 12:00:00 GMT');
                options.headers.append('Cache-Control', 'post-check=0, pre-check=0');
                options.headers.append('Pragma', 'no-cache');
            }
            else {
                options.headers.append('Expires', '-1');
                options.headers.append('Cache-Control', 'no-cache,no-store,must-revalidate,max-age=-1,private');
            }
        }
        return options;
    }

    getBrowserName() {
        if (navigator.userAgent.indexOf("Edge") != -1) {
            return this.browserList.edge;
        }
        else if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
            return this.browserList.opera;
        }
        else if (navigator.userAgent.indexOf("Chrome") != -1) {
            return this.browserList.chrome;
        }
        else if (navigator.userAgent.indexOf("Safari") != -1) {
            return this.browserList.safari;
        }
        else if (navigator.userAgent.indexOf("Firefox") != -1) {
            return this.browserList.firefox;
        }
        else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document['documentMode'] == true)) {
            return this.browserList.ie; //IF IE > 10
        }
        else {
            return this.browserList.unknown;
        }
    }

    private intercept(observable: Observable<Response>): Observable<Response> {
        return observable.catch((err, source) => {
            let bodyObj;
            if (err._body) {
                bodyObj = JSON.parse(err._body);
            }

            if (err.status == 401) {
                localStorage.removeItem(environment.adminTokenKey);
                localStorage.removeItem(environment.userTokenKey);
                this._router.navigate(['/login']);

                this.notifyService.error(bodyObj.ErrorMessage);
                return Observable.throw(bodyObj.ErrorMessage);
            }
            else if (err.status == 400) {
                this.notifyService.error(bodyObj.ErrorMessage);
                return Observable.throw(bodyObj.ErrorMessage);
            }
            else {
                this.notifyService.error();
                return Observable.throw(bodyObj.ErrorMessage);
            }
        });

    }
}