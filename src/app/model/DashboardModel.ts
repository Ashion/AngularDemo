export class AnnouncementModel {
    public Message: string
    public SenderId: string
    public ClientId: string
    public ExpiryDate: Date
    public IsAdmin: boolean
}

export class DisplayAnnouncementModel {
    public AnnouncementId: string
    public Message: string
    public DisplayMessage: string
    public SentDate: Date
    public SenderName: string
    public SenderImagePath: string
    public Region: string
}




export class ItemList {
    constructor() { }
    public Territory: string;
    public Entity: string;
    public Imei: string;
    public Description: string;
    public Type: string;
    public Vin: string;
    public Group: string;
    public Status: boolean;
}