import { SelectedActionsDto } from "./SelectedActionsDto";
import { SelectedNavigationDto } from "./SelectedNavigationDto";

export class UpdateRoleSettingCommand {
    roleOwnerId: string;
    rolecode: string;
    mainpage: string;
    installdevice: boolean;
    SelectedNavigations: SelectedNavigationDto[];
    SelectedActions: SelectedActionsDto[];
}