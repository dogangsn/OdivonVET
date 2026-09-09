export class SelectedNavigationDto {
    target: string;
    action: string;
    constructor(target: string, action: string){
        this.target = target;
        this.action = action;
    }
}