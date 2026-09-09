import { VaccineMedicine } from "./VaccineMedicine";

export class VaccineListDto {
    id: string;
    animalTypeName: string;
    vaccineName: string;
    timeDone: number; // Ne zaman yapılacak
    renewalOption: string; // Yenileme Seçeneği (Guid yerine string kullanıldı)
    obligation : number;
    totalSaleAmount : string;
    animalType: number;
    isAdd: boolean | null;
    vaccineDate: Date | null;
    vetVaccineMedicine : VaccineMedicine[];
}