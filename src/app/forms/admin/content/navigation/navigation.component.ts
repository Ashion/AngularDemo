import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ScriptService } from "app/services/scripts.service";
import { ScriptStore } from 'app/common/scripts.store';

@Component({
  selector: 'admin-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  topMenuSelected: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _scriptService: ScriptService
  ) {
  }

  ngOnInit() {
    this.activatedRoute.url.subscribe(res => {
      this.topMenuSelected = this.router.url.toLowerCase().includes("/admin/settings") ? 'Settings' : 'SiteTools';
    });
  }

  announcementClick() {
    this._scriptService.load('editor').then(res => {
      this.router.navigateByUrl("/admin/settings/announcement");
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
