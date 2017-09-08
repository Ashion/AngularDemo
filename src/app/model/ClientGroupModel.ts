export class ClientGroup {
    constructor(
    ) { }
    public ClientGroupId: string;
    public ClientId: string;
    public Name: string;
    public SupervisorName: string;
    public Description: string;
    public TimezoneId: string;
    public TerritoryId: string;
    public MeasurementUnitId: string;
    public VolumeUnitId: string;
    public TemperatureUnitId: string;
    public CountryId: string;
    public HasDayLightSavingTime: boolean;
    public SunriseTime: any;
    public SunsetTime: any;
    public OperationStartTime: any;
    public OperationEndTime: any;
}

export class GroupVehicle {
    constructor(
    ) { }
    public VehicleId: string;
    public ClientGroupId: string;
    public ClientId: string;
    public Name: string;
    public VIN: string;
    public Rego: string;
    public VehicleTypeId: string;
    public Description: string;
    public Year: string;
    public Make: string;
    public Model: string;
    public HistoryColor: string;
    public TotalOdometerKM: number;
    public IdleEconomy: string;
    public TotalEngineHours: number;
    public Engine: string;
    public EngineType: string;
    public EngineBrand: string;
    public Transmission: number;
    public Temperature: string;
    public Temperature2: string;
    public FuelSystemTypeId: string;
    public BatteryLevel: string;
    public BatteryVoltage: string;
    public IgnitionStatus: number;
    public Fuel: Fuel[];
    public OtherDetails: VehicleOtherDetail = new VehicleOtherDetail();
}

export class Fuel {
    constructor(
    ) { }
    public VehicleTankId: string;
    public TankNo: number;
    public FlowRate: string;
    public FuelCapacity: string;
    public FuelLevel: string;
    public MinFuelVoltage: string;
    public MaxFuelVoltage: string;
    public SensorHeight: string;
    public SpringHeight: string;
    public Circumference: string;
    public TankLength: string;
}

export class VehicleOtherDetail {
    constructor(
    ) { }
    public VehicleDetailId: string;
    public FuelTypeId: string;
    public FuelEconomy: string;
    public FuelCost: string;
    public FuelConsumption: string;
    public RoadSideAssistance: string;
    public RoadSideAssistancePhoneNumber: string;
    public InsuaranceCompany: string;
    public InsuarancePolicy: string;
    public AcquiredDate: Date;
    public InsuaranceExpiryDate: Date;
    public Tag: string;
    public TagState: string;
    public TagIssuedDate: Date;
    public TagExpiryDate: Date;
    public VehicleClassId: string;
    public EquipmentNumber: string;
    public EquipmentLicense: string;
    public EquipmentState: string;
    public EquipmentCountryId: string;
    public EquipmentPrice: number;
    public IsEquipmentOnLease: boolean;
    public CargoSeats: string;
    public CargoTowCapacity: string;
    public CargoGrossVehicleWeightRating: string;
    public CargoPassengerNumber: string;
    public CargoPayload: string;
    public GrantNumber: string;
    public GranteeName: string;
    public GrantActivityNumber: string;
    public CustomDefined1: string;
    public CustomDefined2: string;
    public CustomDefined3: string;
    public CustomDefined4: string;
    public CustomDefined5: string;
}