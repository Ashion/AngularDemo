import { FileStorageModel } from "./FileStorageModel";

export class Client {
    constructor(
    ) { }
    public ClientId: string;
    public Name: string;
    public Username: string;
    public Password: string;
    public ConfirmPassword: string;
    public Contact: string;
    public FirstName: string;
    public LastName: string;
    public Address: string;
    public City: string;
    public State: string;
    public Postcode: string;
    public CountryId: string;
    public ActivationDate: Date;
    public DeactivationDate: Date;
    public Website: string;
    public EmailAddress: string;
    public PhoneNumber: string;
    public FaxNumber: string;
    public ClientTypeId: string;
    public MaxUser: number;
    public MaxGeofence: number;
    public MaxGroup: number;
    public MaxAsset: number;
    public MaxIndividual: number;
    public MaxVehicle: number;
    public LogoId: string;
    public Logo: FileStorageModel;
    public DeletedLogo: FileStorageModel;
}

export class SecurityRoleViewModel {
    constructor() { }
    SecurityRoleId: string;
    BaseClientRoleId: string;
    ClientId: string;
    Name: string;
}

export class SecurityRolePermissionViewModel {
    constructor() { }
    SecurityRolePermissionId: string;
    SecurityRoleId: string;
    PermissionId: string;
    PrivilegeId: string;
}

export class ClientSecurityRoleViewModel {
    constructor() { }
    SecurityRoleViewModel: SecurityRoleViewModel;
    SecurityRolePermissionViewModel: Array<SecurityRolePermissionViewModel>;
}

export class DropDownViewModel {
    constructor() { }
    Id: string;
    Name: string;
}



export class ItemCombo {
    constructor() { }
    public text: string;
    public value: number;
}

export class ClientSecurityList {
    constructor() { }
    Name: string;
    Users: number;
    Permissions: number;
    BaseRole: string
}

export class AssignFromBaseViewModel {
    Unassigned: Array<AssignOrUnassignViewModel>;
    AssignedToClient: Array<AssignOrUnassignViewModel>;
}

export class AssignOrUnassignViewModel {
    constructor() { }
    RoleId: string;
    RoleName: string;
    IsPeopleAssign: boolean;
}


export class AssignPermissionPrivilegeViewModel {
    Permission: Array<PermissionPrivilegeViewModel>;
    Privilege: Array<PermissionPrivilegeViewModel>;
}

export class PermissionPrivilegeViewModel {
    RoleId: string;
    Name: string;
    SystemCode: string;
}

// export  class FilterColumns {
//     public listItems: Array<DropDownViewModel> = [];
//     constructor() {
//         this.listItems.push({ Id: "All", Name: "All" });
//         this.listItems.push({ Id: "ClientName", Name: "Client Name" });
//         this.listItems.push({ Id: "Contact", Name: "Contact" });
//         this.listItems.push({ Id: "Website", Name: "Website" });
//         this.listItems.push({ Id: "ClientType", Name: "Client Type" });
//         this.listItems.push({ Id: "Email", Name: "Email" });
//         this.listItems.push({ Id: "Phone", Name: "Phone" });
//     }
//     public getList(): Array<DropDownViewModel>{
//         return this.listItems;
//     }
// }