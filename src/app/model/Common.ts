export class StatusDetailModel {
    public UpdateTimeUTC: string;
    public Speed: number = 0;
    public TimezoneRegion: string;
}

export class ActivityStatusModel {
    public Key: string;
    public Status: string;
    public Description: string;
    public ColorCode: string;
}