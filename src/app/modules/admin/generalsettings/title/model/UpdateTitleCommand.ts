export class UpdateTitleCommand {
    id : string;
    name: string;
    remark: string;
    isAppointmentShow : boolean;
    constructor(id:string, name: string, remark: string, isAppointmentShow: boolean) {
        this.id = id;
        this.name = name;
        this.remark = remark;
        this.isAppointmentShow = isAppointmentShow;
    }
}