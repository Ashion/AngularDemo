export class PlaceAlertModel {
    public Name: string;
    public PlaceId: string;
    public VehicleIds: string[] = [];
    public UserIds: string[] = [];
    public UserSMSIds: string[] = [];
    public GenerateOnEntry: boolean = true;
    public GenerateOnExit: boolean = false;
    public IsTemporary: boolean = false;
    public TempStartDate: Date;
    public TempEndDate: Date;
    public GenerateOnDays: string;
    public FromTime: string = null;
    public ToTime: string = null;
    public AdditionalEmail: string[] = [];
    public AdditionalPhone: Array<{ CountryId: string, CountryCode: string, PhoneNumber: string }> = [];
}
