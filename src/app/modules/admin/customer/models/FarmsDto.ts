export class FarmsDto {
    // customerId: string;
    farmName: string;
    farmContact: string;
    farmRelationship: string;
    active: boolean;


    constructor(
        // customerId: string,
        farmName: string,
        farmContact: string,
        farmRelationship: string,
        active: boolean,
    ) {
        this.farmName = farmName;
        this.farmContact = farmContact;
        this.farmRelationship = farmRelationship;
        this.active = active;
    }
}