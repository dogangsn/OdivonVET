import { agendaTagsDto } from "./agendaTagsDto";

export class UpdateAgendaCommand {
    id:string;
    agendaNo:number;
    agendaType: number;
    isActive: number;
    agendaTitle:string;
    priority:number;
    notes:string;
    dueDate: string;
    agendaTags: string[];

    constructor(
        id:string,
        agendaNo:number,
        agendaType: number,
        isActive: number,
        agendaTitle:string,
        priority:number,
        notes:string,
        dueDate: string,
        agendaTags: string[]) {
            this.id = id;
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
