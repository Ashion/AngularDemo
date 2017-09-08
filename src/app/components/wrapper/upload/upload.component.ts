import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RequestOptions, Headers } from "@angular/http";
import { FileRestrictions, SelectEvent, ClearEvent, RemoveEvent, UploadEvent, SuccessEvent } from '@progress/kendo-angular-upload';
import { environment } from '../../../../environments/environment';
import { FileStorageModel } from "../../../model/FileStorageModel";

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html'
})
export class UploadComponent implements OnInit {

  @Input() fileObj: FileStorageModel = new FileStorageModel();
  @Output() uploadFile = new EventEmitter();
  @Output() removeFile = new EventEmitter();
  public uploadRestrictions: FileRestrictions = { allowedExtensions: [".jpg", ".png"] };

  constructor() { }

  ngOnInit(): void {
  }

  public selectEventHandler(e: SelectEvent): void {
    let that = this;
    e.files.forEach((file) => {
      if (!file.validationErrors) {
        let reader = new FileReader();
        reader.onload = function (ev) {
          if (!that.fileObj)
            that.fileObj = new FileStorageModel();
          that.fileObj.DisplayFileName = file.name;
          that.fileObj.FileAccessUrl = ev.target['result'];
          that.fileObj.MimeType = file.rawFile.type;
          that.uploadFile.emit(that.fileObj);
        };
        reader.readAsDataURL(file.rawFile);
      }
    });
  }

  uploadEventHandler(e: UploadEvent) {
    e.preventDefault();
  }

  onClearClick() {
    this.removeFile.emit(this.fileObj);
    this.fileObj = new FileStorageModel();
  }

}
