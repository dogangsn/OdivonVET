export class PatientDetailsDto {
    id: string;
    recId: string;
    name: string;
    sex: number;
    animalColor: string;
    animalType: number;
    birthDate: string;
    breedType: string;
    chipNumber: string;
    customerId: string;
    sterilization: boolean;
    reportNumber : string;
    specialNote: string;
    animalBreed : number;
    isVaccineCalendarCreate :boolean;
    animalColorId: number;

    constructor(
        id: string,
        recId: string,
        name: string,
        sex: number,
        animalColor: string,
        animalType: number,
        birthDate: string,
        breedType: string,
        chipNumber: string,
        customerId: string,
        isVaccineCalendarCreate: boolean,
    ) {
        this.id = id;
        this.recId = recId;
        this.name = name;
        this.sex = sex;
        this.animalColor = animalColor;
        this.animalType = animalType;
        this.birthDate = birthDate;
        this.breedType = breedType;
        this.chipNumber = chipNumber;
        this.customerId = customerId;
        this.isVaccineCalendarCreate = isVaccineCalendarCreate;
    }
}
