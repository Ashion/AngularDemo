import { AssignOrUnassignViewModel, DropDownViewModel } from "app/model/ClientModel";

export class DeviceListViewModel {
    public DeviceId: string;
    public ModelName: string;
    public Imei: string;
    public Phone: string;
    public SimId: string;
    public ClientName: string;
    public GroupName: string;
    public IsEnabled: boolean;
    public PurchaseDate: Date;
}



export class MapiconListViewModel {
    constructor() { }
    public Id: string;
    public Name: string;
    public Url: string;
    public IsAssign: boolean;
}

export class DeviceEntityViewModel {
    constructor() { }
    public Id: string;
    public Name: string;
    public CurrentDeviceId: string;
}

export class DeviceViewModel {
    constructor() {
    }
    public DriverId: string;
    public Carrier: AssignOrUnassignViewModel;
    public Clients: AssignOrUnassignViewModel;
    public Conditions: DropDownViewModel;
    public ConditionId: number;
    public DeviceKey: string;
    public Entity: DropDownViewModel;
    public Firmware: string;
    public Group: AssignOrUnassignViewModel;
    public HardwareProfiles: AssignOrUnassignViewModel;
    public Imei: string;
    public InventorySku: string;
    public MapIcon: MapiconListViewModel;
    public Models: AssignOrUnassignViewModel;
    public Phone: string;
    public PndMode: DropDownViewModel;
    public PurchaseDate: Date;
    public ReportingFrequency: string;
    public RmaCode: string;
    public Script: string;
    public SerivePlanId: string;
    public SimId: string;
    public Vehicle: AssignOrUnassignViewModel;
    public Asset: AssignOrUnassignViewModel;
    public TraceColor: string;
    public IsEnabled: boolean;
}



