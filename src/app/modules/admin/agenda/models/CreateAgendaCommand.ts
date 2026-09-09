import { agendaTagsDto } from "./agendaTagsDto";

export class CreateAgendaCommand {
    agendaNo:number;
    agendaType: number;
    isActive: number;
    agendaTitle:string;
    priority:number;
    notes:string;
    dueDate: string;
    agendaTags: agendaTagsDto[];

    constructor(
        agendaNo:number,
        agendaType: number,
        isActive: number,
        agendaTitle:string,
        priority:number,
        notes:string,
        dueDate: string,
        agendaTags: agendaTagsDto[]) {
        this.agendaNo = agendaNo;
        this.agendaType = agendaType;
        this.isActive = isActive;
        this.agendaTitle = agendaTitle;
        this.priority = priority;
        this.notes = notes;
        this.dueDate = dueDate;
        this.agendaTags = agendaTags;


    }
}
