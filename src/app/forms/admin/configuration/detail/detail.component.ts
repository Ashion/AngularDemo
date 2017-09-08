import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from "app/forms/admin/configuration/configuration.service";
import { NotifyService } from "app/services/notification.service";
import { DropDownViewModel } from "app/model/ClientModel";
import { HardwareProfile } from "app/model/ConfigurationModel";
import { ActivatedRoute, Router } from '@angular/router';
import { errors } from "app/shared/globals";

@Component({
  selector: 'configuration-detail',
  templateUrl: './detail.component.html'
})

export class DetailComponent implements OnInit {
  _err = errors;
  public paramId: string;
  public ParserNameList: Array<DropDownViewModel>;
  public ProtocolList: Array<DropDownViewModel>;
  public defaultParser: DropDownViewModel = { Name: "Select Parser", Id: null };
  public defaultProtocol: DropDownViewModel = { Name: "Select Protocol", Id: null };
  model: any = {};
  constructor(private configurationService: ConfigurationService, private notifyService: NotifyService, private route: ActivatedRoute, private router: Router) { }
  ngOnInit() {
    this.route.params.subscribe(param => this.paramId = param["hardwareProfile"]);
    this.configurationService.getParserList().subscribe(
      x => this.ParserNameList = x.Result
    );
    if (this.paramId != "new") {
      this.configurationService.getHardwareProfileById(this.paramId).subscribe(
        x => {
          this.model = <HardwareProfile>x.Result;
          this.model.Protocol.Id = (this.model.Protocol.Name == "TCP") ? "2" : "1";
        }
      );
    }
  }
  portNumberHandler(event: any) {
    if (this.model.PortNumber > 65535) {
      event.preventDefault();
      return false;
    }
    else {
      var charCode = (event.which) ? event.which : event.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
    }
    return true;
  }

  public save(): void {
    var hardwareProfileModel = new HardwareProfile();
    hardwareProfileModel = <HardwareProfile>this.model;
    if (hardwareProfileModel.Protocol.Id != null && hardwareProfileModel.Parser.Id != null) {
      if (parseInt(hardwareProfileModel.PortNumber) < 65536 && parseInt(hardwareProfileModel.PortNumber) > 0) {
        this.configurationService.IsPortProtocolCombination(hardwareProfileModel.HardwareProfileId, hardwareProfileModel.PortNumber, hardwareProfileModel.Protocol.Name).subscribe(
          response => {
            if (!response.Result) {
              this.configurationService.save(hardwareProfileModel).subscribe(x => {
                if (x.Result) {
                  this.router.navigate(['/admin/settings/configuration']);
                  this.notifyService.success("Hardware " + ((this.paramId != "new") ? "updated successfully." : "added successfully."));
                }
              });
            }
            else {
              this.notifyService.error("Protocl & Port are already assigned to another profile.");
            }
          });
      }
    }
  }
}
