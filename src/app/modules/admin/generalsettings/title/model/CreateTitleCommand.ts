export class CreateTitleCommand {
    name: string;
    remark: string;
    isAppointmentShow: boolean;

    constructor(name: string, remark: string, isAppointmentShow: boolean) {
        this.name = name;
        this.remark = remark;
        this.isAppointmentShow = isAppointmentShow;
    }
}