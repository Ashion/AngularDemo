import { Component, OnInit } from '@angular/core';
import { ModelService } from "app/forms/admin/model/model.service";
import { NotifyService } from "app/services/notification.service";
import { ActivatedRoute, Router } from '@angular/router';
import { DropDownViewModel } from "app/model/ClientModel";
import { BindingService } from "app/services/binding.service";
import { FileStorageModel } from "app/model/FileStorageModel";
import { ModelListViewModel, ModelViewModel } from "app/model/ModelViewModel";
import { environment } from "environments/environment";

@Component({
  selector: 'model-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  paramId: string;
  model: any = {};
  public isDuplicateModel: any = null;
  public manufacturerData: Array<DropDownViewModel>;
  public defaultItemManufacturer: DropDownViewModel = { Name: "Select Manufacturer", Id: null };
  public manufacturerValue: DropDownViewModel;
  public modelTypeData: Array<DropDownViewModel>;
  public defaultItemModelType: DropDownViewModel = { Name: "Select Model Type", Id: null };
  public modelTypeValue: DropDownViewModel;
  public uploadFileObj: FileStorageModel = null;
  public deletedFileObj: FileStorageModel = null;
  public logoFile: FileStorageModel = new FileStorageModel();

  constructor(private route: ActivatedRoute, private router: Router, private modelService: ModelService, private notifyService: NotifyService, private bindingService: BindingService) { }
  ngOnInit() {
    this.route.params.subscribe(param => this.paramId = param["modelId"].toLowerCase());
    this.bindingService.getManufacturer().subscribe(
      manufacturer => {
        this.manufacturerData = manufacturer.Result;
      });

    this.bindingService.getModelType().subscribe(
      modelType => {
        this.modelTypeData = modelType.Result;
      });
    if (this.paramId != "new") {
      this.modelService.getById(this.paramId).subscribe(
        response => {
          this.model = response.Result;
          let file = this.model.Logo;
          if (file)
            file.FileAccessUrl = environment.origin + 'Content/' + file.FileAccessUrl + '?' + Math.round(new Date().getTime() / 1000);
          this.logoFile = file;
          if (response.Result.Manufacturer != null) {
            this.manufacturerValue = { Name: response.Result.Manufacturer.Name, Id: response.Result.Manufacturer.Id };
          }
          if (response.Result.ModelType != null) {
            this.modelTypeValue = { Name: response.Result.ModelType.Name, Id: response.Result.ModelType.Id };
          }
        });
    }
  }

  verifyModelName(event: any) {
    if (event.target.value != "") {
      this.modelService.verifyModel(event.target.value, this.paramId).subscribe(res => {
        this.isDuplicateModel = res.Result;
      });
    }
    else
      this.isDuplicateModel = null;
  }


  save() {
    if (!this.isDuplicateModel) {
      var modelObj = new ModelViewModel();
      modelObj = this.model;
      modelObj.Manufacturer = (this.model.Manufacturer != null) ? { Id: this.model.Manufacturer.Id, Name: this.model.Manufacturer.Id } : null;
      modelObj.ModelType = (this.model.ModelType != null) ? { Id: this.model.ModelType.Id, Name: this.model.ModelType.Id } : null;
      if (this.paramId != "new") {
        modelObj.ModelId = this.paramId;
      }
      // File upload ============
      modelObj.Logo = this.uploadFileObj || null;
      modelObj.DeletedLogo = this.deletedFileObj || null;
      // ============= File upload
      this.modelService.saveData(modelObj).subscribe(response => {
        let res: Array<Object> = [];
        res = <Array<Object>>response.Result;
        if (res[2] != null) {
          this.router.navigate(['/admin/tools/model/' + res[2].toString()]);
        }
        else {
          this.router.navigate(['/admin/tools/model']);
        }
        this.notifyService.success((this.paramId == "new") ? "Model added successfully." : "Model updated successfully.");
      });
    }
    else {
      this.notifyService.error("Model name already exist !");
    }
  }

  changeModelInputStyle(): any {
    let color = '';
    if (this.isDuplicateModel == true) {
      color = 'Red';
    }
    if (this.isDuplicateModel == false) {
      color = 'Green';
    }
    return { 'border-color': color };
  }

  onManufacturerChange(value: any): void {
    this.model.Manufacturer = {};
    this.model.Manufacturer.Id = value.Id;
    this.model.Manufacturer.Name = value.Name;
  }
  onModelTypeChange(value: any): void {
    this.model.ModelType = {};
    this.model.ModelType.Id = value.Id;
    this.model.ModelType.Name = value.Name;
  }

  // File upload ============
  onSelectFile(obj: FileStorageModel) {
    this.uploadFileObj = obj;
    if (this.model.LogoId && this.model.Logo)
      this.deletedFileObj = this.model.Logo;
  }

  onRemoveFile(obj: FileStorageModel) {
    if (this.model.LogoId && this.model.Logo)
      this.deletedFileObj = this.model.Logo;
    this.uploadFileObj = null;
  }
  // ============= File upload
}
