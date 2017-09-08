import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifyService } from "app/services/notification.service";
import { DriverTagListViewModel } from "app/model/DriverTagModel";
import { DrivertagService } from "app/forms/admin/drivertag/drivertag.service";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  paramId: string;
  model: any = [];
  public isDuplicate: any = null;

  constructor(private route: ActivatedRoute, private router: Router, private drivertagService: DrivertagService, private notifyService: NotifyService) { }
  ngOnInit() {
    this.route.params.subscribe(param => this.paramId = param["drivertagId"].toLowerCase());
    if (this.paramId != "new") {
      this.drivertagService.getById(this.paramId).subscribe(
        response => {
          this.model = response.Result;
        });
    }
  }

  protected onCancleClick() {
    this.router.navigate(['/admin/tools/drivertag']);
  }

  protected save() {
    if (this.isDuplicate == true) {
      this.notifyService.error("DriverTag already exist.");
      return;
    }
    let driverTagModel = new DriverTagListViewModel();
    driverTagModel.Tag = this.model.Tag;

    if (this.paramId != "new") {
      driverTagModel.Id = this.paramId;
    }
    this.drivertagService.save(driverTagModel).subscribe(response => {
      this.router.navigate(['/admin/tools/drivertag']);
      this.notifyService.success((this.paramId != "new") ? "DriverTag update successfully." : "DriverTag added successfully.");
    });
  }

  protected verifyDriverTag(event: any) {
    if (event.target.value != "") {
      this.drivertagService.verifyDriverTag(event.target.value, this.paramId).subscribe(res => {
        this.isDuplicate = res.Result;
      });
    }
    else
      this.isDuplicate = null;
  }
  protected changeInputStyle(): any {
    let color = '';
    if (this.isDuplicate == true)
      color = 'Red';
    else if (this.isDuplicate == false)
      color = 'Green';
    return { 'border-color': color };
  }

}
