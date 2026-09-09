import { agendaTagsDto } from "./agendaTagsDto";

export class AgendaListByIdQuery {
    id:string;
    agendano:number;
    agendatype: number;
    isactive: number;
    agendatitle:string;
    priority:number;
    notes:string;
    dueDate: string;
    agendatags: agendaTagsDto[];

    constructor(
        id:string,
        agendano:number,
        agendatype: number,
        isactive: number,
        agendatitle:string,
        priority:number,
        notes:string,
        dueDate: string,
        agendatags: agendaTagsDto[]) {
        this.id = id;
        this.agendano = agendano;
        this.agendatype = agendatype;
        this.agendatype = agendatype;
        this.isactive = isactive;
        this.agendatitle = agendatitle;
        this.priority = priority;
        this.notes = notes;
        this.dueDate = dueDate;
        this.agendatags = agendatags;


    }
}
