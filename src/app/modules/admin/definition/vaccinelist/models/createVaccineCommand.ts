import { VaccineMedicine } from "./VaccineMedicine";

export class CreateVaccineCommand{
    animalType: number;
    vaccineName: string;
    timeDone: number;
    renewalOption: string;  
    obligation: number; 
    vaccineMedicine : VaccineMedicine[];

    constructor(
        animalType: number,
        vaccineName: string,
        timeDone: number,
        renewalOption: string,
        obligation: number, 
        vaccineMedicine: VaccineMedicine[]
    ) {
        this.animalType = animalType;
        this.vaccineName = vaccineName;
        this.timeDone = timeDone;
        this.renewalOption = renewalOption;
        this.obligation = obligation; 
        this.vaccineMedicine = vaccineMedicine;
    }
}