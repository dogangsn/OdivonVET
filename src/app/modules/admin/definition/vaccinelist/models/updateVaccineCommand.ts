import { VaccineMedicine } from "./VaccineMedicine";

export class UpdateVaccineCommand{
    id:string;
    animalType: number;
    vaccineName: string;
    timeDone: number;
    renewalOption: string;  
    obligation: number; 
    vaccineMedicine : VaccineMedicine[];

    constructor(
        id:string,
        animalType: number,
        vaccineName: string,
        timeDone: number,
        renewalOption: string,
        obligation: number, 
        vaccineMedicine: VaccineMedicine[]
    ) {
        this.id = id;
        this.animalType = animalType;
        this.vaccineName = vaccineName;
        this.timeDone = timeDone;
        this.renewalOption = renewalOption;
        this.obligation = obligation; 
        this.vaccineMedicine = vaccineMedicine;
    }
}