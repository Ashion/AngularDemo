import { DropDownViewModel } from "app/model/ClientModel";

export class HardwareProfile {
    constructor(
    ) { }
    public HardwareProfileId: string;
    public Parser: DropDownViewModel;
    public ParserName: string;
    public ProfileName: string;
    public Protocol: DropDownViewModel;
    public ProtocolName: string;
    public PortNumber: string;
    public Description: string;
    public Firmware: string;
    public ImagePath: string;
    public TravelDistance: string;
    public StopSpeedThreshold: string;
    public HasPingSupport: boolean;
    public PingMessage: string;
    public IsDeleted: boolean;
    public TotalNoDevice: number;
}


export class HardwareViewModel {
    constructor(
    ) { }
    public HardwareProfileId: string;
    public ProfileName: string;
    public ParserName: string;
    public ProtocolName: string;
    public PortNumber: number;
    public Description: string;
    public IsSelected: boolean;
    public TotalNoDevice: number;
}