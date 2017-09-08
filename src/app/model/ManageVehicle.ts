import { DropDownViewModel } from "app/model/ClientModel";
import { ActivityStatusModel } from "app/model/Common";

export class ManageVehicleModel {
    public VehicleId: string;
    public Name: string;
    public Rego: string;
    public IsPrivateTrip: boolean = false;
    public IsTripTypeSwitched: boolean = true;
    public VehicleLabels: Array<VehicleLabelModel> = [];
    public DefaultDriverId: string;
    public Drivers: Array<DropDownViewModel> = [];
    public Devices: Array<DropDownViewModel> = [];
    public IMEI: string;
    public CurrentDeviceId: string;
}

export class VehicleLabelModel {
    public VehicleLabelId: string;
    public VehicleId: string;
    public Name: string;
    public VehicleColorId: string;
    public ColorCode: string;
    public IsAdded: boolean = false;
    public IsModified: boolean = false;
    public IsDeleted: boolean = false;
}

export class ManageVehicleStatusModel {
    public AcitvityStatus: ActivityStatusModel;
    public DisplayContent: any;
}