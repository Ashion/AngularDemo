import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { boundShape } from "app/shared/globals";

declare var google: any;

@Injectable()
export class MapService {
    private static promise;

    public static load() {
        // First time 'load' is called?
        if (!MapService.promise) {

            // Make promise to load
            MapService.promise = new Promise(resolve => {

                // Set callback for when google maps is loaded.
                window['__onGoogleLoaded'] = (ev) => {
                    boundShape(google);
                    resolve('google maps api loaded');
                };

                let nodeCluster = document.createElement('script');
                nodeCluster.src = "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js";
                nodeCluster.type = 'text/javascript';
                document.getElementsByTagName('head')[0].appendChild(nodeCluster);

                let node = document.createElement('script');
                node.src = environment.googleMapUrl + "&key=" + environment.mapApiKey + "&callback=__onGoogleLoaded";
                node.type = 'text/javascript';
                document.getElementsByTagName('head')[0].appendChild(node);
            });
        }

        // Always return promise. When 'load' is called many times, the promise is already resolved.
        return MapService.promise;
    }

    http: Http;

    constructor(
        _http: Http
    ) {
        this.http = _http;
    }

    // Get address by lat lng 
    getAddress(location: string) {
        return this.http.get(environment.googleLocationUrl.replace("##LATLNG##", location))
            .map(response => {
                let data = response.json()
                return data.results && data.results[0] ? data.results[0].formatted_address : "";
            });
    }
}