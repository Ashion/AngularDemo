import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { storageKeys } from "app/shared/globals";

@Injectable()
export class Groupcheck implements CanActivate {
  constructor() { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    if (localStorage.getItem(storageKeys.groupEditorId) && localStorage.getItem(storageKeys.groupEditorId) != 'new') {
      return true
    }
    else {
      return false;
    }
  }
}