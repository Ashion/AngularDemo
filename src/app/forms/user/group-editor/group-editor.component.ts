import { Component, OnInit, OnDestroy } from '@angular/core';
import { storageKeys } from "app/shared/globals";

@Component({
  selector: 'app-group-editor',
  templateUrl: './group-editor.component.html'
})

export class GroupEditorComponent implements OnInit, OnDestroy {

  constructor() {
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    localStorage.removeItem(storageKeys.groupEditorId);
  }

}
