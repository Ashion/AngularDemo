import { FileStorageModel } from "app/model/FileStorageModel";
import { DropDownModel } from "app/model/DropDownModel";

export class PeopleList {
    PeopleId: string;
    Name: string;
    FirstName: string;
    LastName: string;
    LicenseNumber: string;
    TagCode: string;
    EmailAddress: string;
    SecurityRole: string;
    IsClientAdmin: boolean;
    IsActive: boolean;
    LastLogin: string;
    PhotoId: string;
    Photo: FileStorageModel;
    DeletedPhoto: FileStorageModel;
}


export class People {
    PeopleId: string;
    ClientId: string;
    Username: string = "";
    FirstName: string;
    LastName: string;
    LicenseNumber: string;
    TagCode: string;
    PhoneNumber: string;
    EmailAddress: string;
    IsLicenseExpiryReminderEnabled: boolean;
    SecurityRole: DropDownModel;
    CanLogin: boolean;
    PhotoId: string;
    Photo: FileStorageModel;
    DeletedPhoto: FileStorageModel;
    DefaultUrl: string;
    IsDriver: boolean;
    ClientGroupId: string;
    VehicleList: Array<string>;
}
