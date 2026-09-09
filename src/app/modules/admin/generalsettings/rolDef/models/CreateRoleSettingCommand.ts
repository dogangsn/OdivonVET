import { SelectedActionsDto } from "./SelectedActionsDto";
import { SelectedNavigationDto } from "./SelectedNavigationDto";

export class CreateRoleSettingCommand {
    rolecode: string;
    mainpage: string;
    installdevice: boolean;
    SelectedNavigations: SelectedNavigationDto[];
    SelectedActions: SelectedActionsDto[];
}