import { FileStorageModel } from "app/model/FileStorageModel";
import { DropDownViewModel } from "app/model/ClientModel";

export class ModelListViewModel {
    constructor() { }
    public ModelId: string;
    public Name: string;
    public ManufacturerName: string;
    public ModelTypeName: string;
    public ProductUrl: string;
    public GatewayName: string;
    public GatewayPassword: string;
}
export class ModelViewModel {
    constructor() { }
    public ModelId: string;
    public Name: string;
    public Manufacturer: DropDownViewModel;
    public ModelType: DropDownViewModel;
    public ProductUrl: string;
    public GatewayName: string;
    public GatewayPassword: string;
    public ImageId: string;
    public LogoId: string;
    public Logo: FileStorageModel;
    public DeletedLogo: FileStorageModel;
}