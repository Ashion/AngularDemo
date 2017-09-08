import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../alerts.service';

@Component({
  selector: 'alerts-type-alert',
  templateUrl: './alert.component.html'
})

export class AlertComponent implements OnInit {

  filterText: string;

  constructor(
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit() {

  }

}
