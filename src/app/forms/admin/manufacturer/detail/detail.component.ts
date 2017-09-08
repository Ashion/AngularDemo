import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ManufacturerService } from "app/forms/admin/manufacturer/manufacturer.service";
import { ManufacturerModel } from "app/model/ManufacturerModel";
import { NotifyService } from "app/services/notification.service";

@Component({
  selector: 'manufacturer-detail',
  templateUrl: './detail.component.html'

})
export class DetailComponent implements OnInit {
  paramId: string;
  model: any = [];
  constructor(private route: ActivatedRoute, private router: Router, private manufacturerService: ManufacturerService, private notifyService: NotifyService) { }
  ngOnInit() {
    this.route.params.subscribe(param => this.paramId = param["manufacturerId"].toLowerCase());
    if (this.paramId != "new") {
      this.manufacturerService.getById(this.paramId).subscribe(
        response => {
          this.model = response.Result;
        });
    }
  }

  protected onCancleClick() {
    this.router.navigate(['/admin/tools/manufacturer']);
  }

  protected save() {
    let manufacturerModel = new ManufacturerModel();
    manufacturerModel.Name = this.model.Name;
    manufacturerModel.Website = this.model.Website;
    manufacturerModel.PhoneNumber = this.model.PhoneNumber;

    if (this.paramId != "new") {
      manufacturerModel.ManufacturerId = this.paramId;
    }
    this.manufacturerService.save(manufacturerModel).subscribe(response => {
      this.router.navigate(['/admin/tools/manufacturer']);
      this.notifyService.success((this.paramId != "new") ? "Manufacturer update successfully." : "Manufacturer added successfully.");
    });
  }
}
