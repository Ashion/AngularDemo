export class PlaceModel {
    public PlaceId: string;
    public ClientId: string;
    public Name: string;
    public SquareMeterArea: number;
    public HasCircularGeofence: boolean;
    public GeofenceCoordinates: string;
    public CenterCoordinate: string;
    public Radius: number;
    public VehicleFromTripList: Array<any> = [];
    public VehicleDestinationTripList: Array<any> = [];
    public DeviceMessageList: Array<any> = [];
}