import { agendaTagsDto } from "./agendaTagsDto";

export class agendaDto {
    id: string;
    agendaNo:number;
    agendaType: number;
    isActive: number;
    agendaTitle:string;
    priority:number;
    notes:string;
    dueDate: string;
    agendaTags: agendaTagsDto[];
}
