import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../alerts.service';

@Component({
  selector: 'alerts-type',
  templateUrl: './type.component.html'
})

export class TypeComponent implements OnInit {

  filterText: string;

  constructor(
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit() {

  }

}
