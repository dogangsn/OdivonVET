import { PatientDetails } from './PatientDetailsCommand';

export class CreatePatientCommand {
    customerId: string;
    patientDetails: PatientDetails;
    constructor(customerId: string, patientDetails: PatientDetails) {
        this.customerId = customerId;
        this.patientDetails = patientDetails;
    }
}
