import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifyService } from 'app/services/notification.service';
import { AlertService } from '../alerts.service';
import { BehaviorSubject } from "rxjs/BehaviorSubject";

declare var google: any;

@Component({
  selector: 'alerts-detail',
  templateUrl: './detail.component.html'
})

export class DetailComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private alertService: AlertService
  ) {

  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }

}
