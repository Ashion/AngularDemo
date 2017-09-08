import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmPopup } from 'app/components/wrapper/confirm-popup';
import { MapService } from 'app/services/map.service';
import { NotifyService } from 'app/services/notification.service';
import { startsWith as _startsWith } from 'lodash';
import { PlaceService } from '../place.service';

declare var google: any;

@Component({
  selector: 'places-display',
  templateUrl: './display.component.html'
})

export class DisplayComponent implements OnInit {

  mapReady = false;
  loadingPlaces: boolean = false;
  loadingSuggestions: boolean = false;
  placesData: any = [];
  places: any = [];
  mostVisitedPlaces: any = [];
  skipRecord: number = 0;
  suggestionsEnd: boolean = false;

  constructor(
    private router: Router,
    private mapService: MapService,
    private placeService: PlaceService,
    private confirmPopup: ConfirmPopup,
    private notifyService: NotifyService
  ) { }

  ngOnInit() {
    MapService.load().then(res => {
      this.mapReady = true;
    });

    this.loadPlacesData();
    this.loadSuggestionsData();
  }

  // load places data from db
  loadPlacesData() {
    this.loadingPlaces = true;
    this.placeService.getAllPlaces().subscribe(res => {
      this.loadingPlaces = false;
      this.places = this.placesData = res.Result;
      let that = this;
      setTimeout(function () {
        that.placeService.setPlaces(that.places);
      }, 500);
    }, err => this.loadingPlaces = false);
  }

  // load most visted places within last 30 days
  loadSuggestionsData() {
    this.loadingSuggestions = true;
    this.placeService.getMostVisitedPlaces(this.skipRecord).subscribe(res => {
      this.loadingSuggestions = false;
      if (res && res.Result.length != 5) this.suggestionsEnd = true;
      if (res && res.Result) {
        this.mostVisitedPlaces.push(...res.Result);
        let that = this;
        setTimeout(function () {
          that.placeService.setMostVisitedPlaces(that.mostVisitedPlaces);
        }, 500);
      }
    }, err => this.loadingSuggestions = false);
  }

  // handle keyup for search textbox
  searchKeyUp(e, element) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code === 27) {
      this.clearFilter(element);
    }
  }

  // filter for search places
  searchPlaces(event: Event) {
    let searchText = (<HTMLInputElement>event.target).value.toLowerCase();
    this.places = this.placesData.filter(p => _startsWith(p.Name.toLowerCase(), searchText));
  }

  // clear filter
  clearFilter(element: HTMLInputElement) {
    this.places = this.placesData;
    element.value = ''
  }

  // delete place
  deletePlace(placeId) {
    this.confirmPopup.openConfirmation("Are you sure to delete this Place?").then(res => {
      this.placeService.delete(placeId).subscribe(res => {
        this.loadPlacesData();

        // reset suggestions tab
        this.mostVisitedPlaces = [];
        this.skipRecord = 0;
        this.loadSuggestionsData();

        this.notifyService.success('Place deleted successfully.');
      });
    });
  }

  // handle click event of Load more suggestions
  loadMoreSuggestions() {
    this.skipRecord += 5;
    this.loadSuggestionsData();
  }

  // handle tab change event
  onTabChange(tab) {
    this.placeService.selectedTab(tab.index);
  }

  // handle click event of add places in suggestions
  addSuggestion(name: string) {
    localStorage.setItem("suggestionName", name);
    this.router.navigate(['/user/places/suggestion']);
  }

  ngOnDestroy() {
    this.placeService.clearPlaces();
  }
}
