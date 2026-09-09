export interface Tag
{
    // id?: string;
    // title?: string;
    id?: string;
    tags?:string;
    tagsId?:string;

}

export class Agenda
{
    id: string;
    agendaNo:number;
    agendaType: number;
    agendaTitle: string;
    notes: string;
    isActive: boolean;
    dueDate: string ;
    priority: number;
    agendaTags: string[];
    order: number;
}
export interface AgendaTitleUpdate
{
    id: string;
    agendaNo:number;
    agendaType: number;
    agendaTitle: string;
    notes: string;
    isActive: number;
    dueDate: string;
    priority: number;
    agendaTags: string[];
    order: number;
}
export interface getAgendaModel
{
    id: string;
    agendaNo:number;
    agendaType: '0' | '1';
    agendaTitle: string;
    notes: string;
    isActive: number;
    dueDate: string | null;
    priority: number;
    agendaTags: string[];
    order: number;
}