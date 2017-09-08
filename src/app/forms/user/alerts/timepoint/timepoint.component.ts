import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../alerts.service';

@Component({
  selector: 'alerts-type-timepoint',
  templateUrl: './timepoint.component.html'
})

export class TimepointComponent implements OnInit {

  filterText: string;

  constructor(
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit() {

  }

}
