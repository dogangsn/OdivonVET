import { PatientDetails } from "./PatientDetailsCommand";

export class CreateCustomerCommand {
    // Id:string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    phoneNumber2: string;
    eMail: string;
    taxOffice: string;
    vKNTCNo: string;
    note: string;
    discountRate: number;
    province: string;
    district: string;
    longAdress: string;
    isEmail: boolean;
    isPhone: boolean;
    PatientDetails : PatientDetails[];
    customerGroup : string;

// constructor(
//     firstName: string,
//     lastName: string,
//     phoneNumber: string,
//     phoneNumber2: string,
//     eMail: string,
//     taxOffice: string,
//     vKNTCNo: string,
//     note: string,
//     discountRate: number,
//     province: string,
//     district : string,
//     longAdress : string
// ){
//     this.firstName = firstName;
//     this.lastName = lastName;
//     this.phoneNumber = phoneNumber;
//     this.phoneNumber2 = phoneNumber2;
//     this.eMail = eMail;
//     this.taxOffice = taxOffice;
//     this.vKNTCNo = vKNTCNo;
//     this.note = note;
//     this.discountRate = discountRate;
//     this.province = province;
//     this.district = district;
//     this.longAdress = longAdress;
// }

}