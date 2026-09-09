export class UpdateUserCommand {
    active: boolean;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    roleId: string;
    authorizeEnterprise: boolean | null;
    properties: string[];
    accountType: number;
    phone: string;
    appKey: string;
    titleId: string;
}