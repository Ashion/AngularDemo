import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fleet',
  templateUrl: './fleet.component.html'
})

export class FleetComponent implements OnInit {

  constructor(
    private router: Router
  ) {
    if (this.router.url.toLowerCase().endsWith("logbook"))
      this.router.navigate(['/user/fleet']);
  }

  ngOnInit() { }


}
