import { Injectable, Optional } from '@angular/core';
import { Http } from '@angular/http';
import { ApiResponseModel } from 'app/model/ApiResponseModel';
import { PlaceModel } from 'app/model/Place';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PlaceService {
    http: Http;
    subDrawingMode = new BehaviorSubject(null);
    subRadius = new BehaviorSubject(null);
    subPlaces = new BehaviorSubject(null);
    subMostVisitedPlaces = new BehaviorSubject(null);
    subPlaceDetail = new BehaviorSubject(null);
    subTabIndex = new BehaviorSubject(0);

    constructor(_http: Http) {
        this.http = _http;
    }

    // Drawing mode services
    setDrawingMode(mode) {
        this.subDrawingMode.next({ drawingMode: mode });
    }
    clearDrawingMode() {
        this.subDrawingMode.next(null);
    }
    getDrawingMode(): Observable<any> {
        return this.subDrawingMode.asObservable();
    }

    // Circle radius services
    setCircleRadius(radius) {
        this.subRadius.next({ radius: radius });
    }
    clearCircleRadius() {
        this.subRadius.next(null);
    }
    getCircleRadius(): Observable<any> {
        return this.subRadius.asObservable();
    }

    // Save place
    save(place: PlaceModel): Observable<ApiResponseModel> {
        return this.http.post('private/place/save', place)
            .map(response => response.json());
    }

    getAllPlaces() {
        return this.http.get('private/place/display')
            .map(response => response.json());
    }
    setPlaces(places) {
        this.subPlaces.next(places);
    }
    subscribeToPlaces(): Observable<any> {
        return this.subPlaces.asObservable();
    }
    clearPlaces() {
        this.subPlaces.next(null);
    }

    // Check duplicate value of place during add
    checkDuplicate(text: string, placeId: string): Observable<ApiResponseModel> {
        return this.http.get('private/place/checkduplicate', { params: { name: text, id: placeId } })
            .map(response => response.json());
    }

    // delete place by id
    delete(placeId: string): Observable<ApiResponseModel> {
        return this.http.post('private/place/delete', JSON.stringify(placeId))
            .map(response => response.json());
    }

    // get place by id
    loadPlaceById(placeId: string) {
        return this.http.get('private/place/getById?placeId=' + placeId)
            .map(response => this.subPlaceDetail.next(response.json().Result));
    }
    setPlaceDetail(places) {
        // this is for suggestion
        return this.subPlaceDetail.next(places);
    }
    subscribeToPlaceDetail(): Observable<any> {
        return this.subPlaceDetail.asObservable();
    }
    clearPlaceDetail() {
        this.subPlaceDetail.next(null);
    }
    getVehicleTrips(placeId: string): Observable<ApiResponseModel> {
        return this.http.get('private/place/getvehicletrips?placeId=' + placeId)
            .map(response => response.json());
    }

    // get most visited places
    getMostVisitedPlaces(skipRecord: number) {
        return this.http.get('private/place/mostvisited?offset=' + skipRecord)
            .map(response => response.json());
    }
    setMostVisitedPlaces(places) {
        this.subMostVisitedPlaces.next(places);
    }
    subscribeToMostVisitedPlaces(): Observable<any> {
        return this.subMostVisitedPlaces.asObservable();
    }
    clearMostVisitedPlaces() {
        this.subMostVisitedPlaces.next(null);
    }


    // tab selections
    selectedTab(index) {
        this.subTabIndex.next(index);
    }
    resetSelectedTab(index = 0) {
        this.subTabIndex.next(index);
    }
    subscribeSelectedTab(): Observable<any> {
        return this.subTabIndex.asObservable();
    }

}