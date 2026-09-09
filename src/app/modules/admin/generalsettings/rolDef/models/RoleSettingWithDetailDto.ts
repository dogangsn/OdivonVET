export interface RoleSettingDetailDto {
    recid: string;  // Guid is mapped to string
    target: string;
    action: string;
    roleSettingId: string;  // Guid is mapped to string
  }
  
  export interface RoleSettingsDto {
    id: string;  // Guid is mapped to string
    rolecode: string;
    createdDate: Date;
    dashboardPath: string;
    deleted: boolean;
    installdevice: boolean;
    isEnterpriseAdmin: boolean;
    roleSettingDetails: RoleSettingDetailDto[];
  }