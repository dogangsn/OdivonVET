export const endPoints = {
    auth: {
        forgotPassword: 'api/auth/forgot-password',
        resetPassword: 'api/auth/reset-password',
        signIn: 'identityserver/connect/token',
        signInUsingToken: 'api/auth/sign-in-with-token',
        signUp: 'identityserver/api/user/SignUp',
        unlockSession: 'api/auth/unlock-session',
    },
    account: {
        createaccount: 'identityserver/api/account/create',
        complateactivation: 'identityserver/api/account/complateactivation',
        refreshactivation: 'identityserver/api/account/RefreshActivation'
    },
    settings: {
        getUsersList: 'account/settings/GetUsersList',
        getCompany: 'account/settings/GetCompany',
        updateCompany: 'account/settings/UpdateCompany',
        createUsers: 'account/settings/CreateUser',
        updateUsers: 'account/settings/UpdateUser',
        getRolsSettings: 'account/settings/GetRoleSettingList',
        getUserRolsSettings: 'account/settings/GetUserRoleSettingList',
        getRoleSettingById: 'account/settings/GetRoleSettingById',
        createRols: 'account/settings/CreateRoleSetting',
        updateRols: 'account/settings/UpdateRoleSetting',
        deleteRols: 'account/settings/DeleteRoleSetting',
        getNavigation: 'account/settings/GetNavigation',
        getActiveUser: 'account/settings/GetActiveUser',
        getBranchList: 'account/settings/GetBranchList',
        createBranch: 'account/settings/CreateBranch',
        updateBranch: 'account/settings/UpdateBranch',
        deleteBranch: 'account/settings/DeleteBranch'
    },
    customers: {
        customerslist: 'vet/Customers/CustomersList',
        createCustomers: 'vet/Customers/CreateCustomer',
        deleteCustomer: 'vet/Customers/DeleteCustomer',
        animalsTypeList: 'vet/Customers/VetAnimalsTypeList',
        animalBreedsDefList: 'vet/Customers/AnimalBreedsDefList',
        getCustomersFindById: 'vet/Customers/GetCustomersFindById',
        updateCustomerById: 'vet/Customers/UpdateCustomerById',
        createPatient: 'vet/Customers/CreatePatient',
        deletePatient: 'vet/Customers/DeletePatient',
        getTransactionMovement: 'vet/Customers/GetTransactionMovementList',
        getPaymentTransaction: 'vet/Customers/GetPaymentTransactionList',
        createCollection: 'vet/Customers/CreateCollection',
        getpaychartList: 'vet/Customers/GetPayChartList',
        deletePayChart: 'vet/Customers/DeletePayChart',
        getPatients: 'vet/Customers/GetPatientsByCustomerId',
        sendMessage: 'vet/Customers/SendMessage',
        createSale: 'vet/Accounting/CreateSale',
        updateSale: 'vet/Accounting/UpdateSale',
        getSalesCustomerList: 'vet/Customers/GetSalesCustomerList',
        createSaleCollection: 'vet/Accounting/CreateSaleCollection',
        updateSaleCollection: 'vet/Accounting/UpdateSaleCollection',
        deleteCollection: 'vet/Accounting/DeleteCollection',
        getSalesById: 'vet/Accounting/GetSalesById',
        balanceCollection: 'vet/Accounting/CreateBalanceSaleCollection',
        updatePatient: 'vet/Customers/UpdatePatient',
        updateCustomerArchive: 'vet/Customers/UpdateCustomerArchive',
        getFarmCustomersList: 'vet/Customers/GetFarmCustomersList'
    },
    examinations: {
        examinationlist: 'vet/Patient/GetExaminations',
        getExamination: 'vet/Patient/GetExaminationByRecId',
        createExamination: 'vet/Patient/CreateExamination',
        symptomlist: 'vet/Patient/GetSymptoms',
        deleteExamination: 'vet/Patient/DeleteExamination',
        updateExamination: 'vet/Patient/UpdateExamination',
        updateExaminationStatus: 'vet/Patient/UpdateExaminationStatus',
        getExaminationlistByPatient: 'vet/Patient/getExaminationlistByPatientId',
        getExaminationsBySaleList: 'vet/Patient/GetExaminationsBySaleList'
    },

    productdescription: {
        productdescriptionList: 'vet/Definition/ProductDescriptionList',
        createProductDescriptions: 'vet/Definition/CreateProductDescription',
        updateProductDescriptions: 'vet/Definition/UpdateProductDescription',
        deleteProductDescriptions: 'vet/Definition/DeleteProductDescription',
        productDescriptionFilters: 'vet/Definition/ProductDescriptionFilters',
        productMovementList: 'vet/Definition/ProductMovementList',
        updateProductActive: 'vet/Definition/UpdateProductActive'
    },
    productcategory: {
        productcategoryList: 'vet/Definition/ProductCategoryList',
        createProductCategory: 'vet/Definition/CreateProductCategories',
        updateProductCategory: 'vet/Definition/UpdateProductCategories',
        deleteProductCategory: 'vet/Definition/DeleteProductCategories',
    },
    units: {
        unitsList: 'vet/Definition/UnitsList',
        createUnits: 'vet/Definition/CreateUnits',
        updateUnits: 'vet/Definition/UpdateUnits',
        deleteUnits: 'vet/Definition/DeleteUnits',
    },
    casedefinition: {
        casedefinitionList: 'vet/Definition/CasingDefinitionList',
        Createcasedefinition: 'vet/Definition/CreateCasingDefinition',
        Updatecasedefinition: 'vet/Definition/UpdateCasingDefinition',
        Deletecasedefinition: 'vet/Definition/DeleteCasingDefinition'
    },
    customergroup: {
        customerGroupList: 'vet/Definition/CustomerGroupList',
        createCustomerGroupDef: 'vet/Definition/CreateCustomerGroupDef',
        updateCustomerGroupDef: 'vet/Definition/UpdateCustomerGroupDef',
        deleteCustomerGroupDef: 'vet/Definition/DeleteCustomerGroupDef',
    },
    store: {
        storeList: 'vet/Store/StoreList',
        createStore: 'vet/Store/CreateStore',
        updateStore: 'vet/Store/UpdateStore',
        deleteStore: 'vet/Store/DeleteStore'
    },
    suppliers: {
        suppliersList: 'vet/Suppliers/SuppliersList',
        Createsuppliers: 'vet/Suppliers/CreateSuppliers',
        Updatesuppliers: 'vet/Suppliers/UpdateSuppliers',
        Deletesuppliers: 'vet/Suppliers/DeleteSuppliers'
    },
    animalColorsDef: {
        animalColorsDefList: "vet/Definition/AnimalColorsDefList",
        CreateAnimalColorsDef: "vet/Definition/CreateAnimalColorsDef"
    },
    saleBuy: {
        createSaleBuy: "vet/SaleBuy/CreateSaleBuy",
        saleBuyList: "vet/SaleBuy/SaleBuyList",
        saleBuyFilter: 'vet/SaleBuy/SaleBuyListFilter',
        deleteSaleBuy: 'vet/SaleBuy/DeleteSaleBuy',
        updateSaleBuy: 'vet/SaleBuy/UpdateSaleBuy'
    },
    paymentmethods: {
        paymentmethodsList: 'vet/Definition/PaymentMethodList',
        createPaymentMethods: 'vet/Definition/CreatePaymentMethods',
        updatePaymentMethods: 'vet/Definition/UpdatePaymentMethods',
        deletePaymentMethods: 'vet/Definition/DeletePaymentMethods',
    },
    agenda: {
        agendaList: 'vet/Agenda/AgendaList',
        agendaListById: 'vet/Agenda/AgendaListById',
        Createagenda: 'vet/Agenda/CreateAgenda',
        Updateagenda: 'vet/Agenda/UpdateAgenda',
        Deleteagenda: 'vet/Agenda/DeleteAgenda'
    },
    demandproducts: {
        demandproductsList: 'vet/Demands/DemandProductsList',
        Createdemandproducts: 'vet/Demands/CreateDemandProducts',
        Updatedemandproducts: 'vet/Demands/UpdateDemandProducts',
        Deletedemandproducts: 'vet/Demands/DeleteDemandProducts'
    },
    demands: {
        demandsList: 'vet/Demands/DemandList',
        createdemand: 'vet/Demands/CreateDemand',
        updatedemand: 'vet/Demands/UpdateDemand',
        deletedemand: 'vet/Demands/DeleteDemand',
        updatebuydemands: 'vet/Demands/UpdateDemandIsBuying'
    },
    demandTrans: {
        demandsTransList: 'vet/Demands/DemandTransList',
    },
    demandComplate: {
        demandsComplateList: 'vet/Demands/DemandComplatedList'
    },
    lab: {
        customersLabList: 'vet/lab/CustomersLabList',
        getLabDocumentByIdQuery: 'vet/lab/GetLabDocumentById'
    },
    parameters: {
        parametersList: 'vet/Settings/ParametersList',
        updateparameters: 'vet/Settings/UpdateParameters',
        createsmsparameters: 'vet/Settings/CreateSmsParameters',
        updatesmsparameters: 'vet/Settings/UpdateSmsParameters',
        getSmsParametersIdBy: 'vet/Settings/GetSmsParametersIdBy',
        getlogs: 'vet/Settings/GetLogs',
        getSmsParametersList: 'vet/Settings/GetSmsParametersList'
    },
    chat: {
        getAllUsers: 'chat/Account/GetAllUsers'
    },
    appointments: {
        appointmensList: 'vet/Appointment/AppointmentsList',
        createappointment: 'vet/Appointment/CreateAppointment',
        deleteappointment: 'vet/Appointment/DeleteAppointment',
        updateappointment: 'vet/Appointment/UpdateAppointment',
        getvetuserslist: 'vet/GeneralSettings/GetVetUsersList',
        appointmentsByIdList: 'vet/Appointment/AppointmentFindByIdList',
        updatePaymentReceivedAppointment: 'vet/Appointment/UpdatePaymentReceivedAppointment',
        updateCompletedAppointment: 'vet/Appointment/UpdateCompletedAppointment',
        getAppointmentDailyList: 'vet/Appointment/GetAppointmentDailyList',
        updateAppointmentStatus: 'vet/Appointment/UpdateAppointmentStatus',
        getAppointmentListByPatientId: 'vet/Appointment/GetAppointmentListByPatientId',
        appointmentDateCheckControl: 'vet/Appointment/AppointmentDateCheckControl'
    },
    title: {
        titleDefinationList: 'account/settings/GetTitleDefination',
        createtitle: 'account/settings/CreateTitleDefination',
        updatetitle: 'account/settings/UpdateTitleDefination',
        deleteTitle: 'account/settings/DeleteTileDefination',

    },
    mailing: {
        getsmptsettingsList: 'mail/Mailing/GetSmtpSettings',
        createMailSettings: 'mail/Mailing/CreateSmtpSetting',
        deletedMaildSettings: 'mail/Mailing/DeleteSmtpSetting',
        updateMailSettings: 'mail/Mailing/UpdateSmtpSetting',
        sendMail: 'mail/Mailing/SendMail'
    },
    dashboards: {
        getdashBoard: 'vet/Dashboard/GetDashBoard'
    },
    clinicalstatistics: {
        getClinicalstatisticsList: 'vet/Clinicalstatistics/GetClinicalstatisticsList',
        getGraphicList: 'vet/Clinicalstatistics/GetGraphicList',
        getweekVisitList: 'vet/Clinicalstatistics/WeekVisitList',
        getbagelSliceGraphList: 'vet/Clinicalstatistics/BagelSliceGraphList'
    },
    appointmenttypes: {
        getAppointmentTypes: 'vet/Definition/GetAppointmentTypesList',
        createAppointmentTypes: 'vet/Definition/CreateAppointmentTypes',
        deleteAppointmentTypes: 'vet/Definition/DeleteAppointmentTypes',
        updateAppointmentTypes: 'vet/Definition/UpdateAppointmentTypes'
    },
    taxis: {
        getTaxisList: 'vet/Definition/GetTaxisList',
        createTaxis: 'vet/Definition/CreateTaxis',
        deleteTaxis: 'vet/Definition/DeleteTaxis',
        updateTaxis: 'vet/Definition/UpdateTaxis'
    },
    reports: {
        createFilter: 'vet/Reports/CreateReportFilter',
        getAppointmentDashboard: 'vet/Reports/GetAppointmentDashboard',
    },
    vaccine: {
        vaccineList: 'vet/Vaccine/VaccineList',
        createVaccine: 'vet/Vaccine/CreateVaccine',
        deleteVaccine: 'vet/Vaccine/DeteleVaccine',
        updateVaccine: 'vet/Vaccine/UpdateVaccine'
    },
    vaccineCalendar: {
        patientVaccineList: 'vet/VaccineCalendar/PatientVaccineList',
        createVaccineExaminations: 'vet/VaccineCalendar/CreateVaccineExamination',
        deletePatientVaccine: 'vet/VaccineCalendar/DeteleVaccineAppointment',
        updateVaccineExamination: 'vet/VaccineCalendar/UpdateVaccineExamination',
        allVaccineAppointmentsList: 'vet/VaccineCalendar/AllVaccineAppointmentsList'
    },
    pethotels: {
        getRoomList: 'vet/PetHotels/getRoomList',
        createRoom: 'vet/PetHotels/CreateRoom',
        updateRoom: 'vet/PetHotels/UpdateRoom',
        deleteRoom: 'vet/PetHotels/DeleteRoom',
        getAccomodationList: 'vet/PetHotels/GetAccomodationList',
        createAccommodation: 'vet/PetHotels/CreateAccomodation',
        updateAccomodation: 'vet/PetHotels/UpdateAccomodation',
        deleteAccomodation: 'vet/PetHotels/DeleteAccomodation',
        updateCheckOut: 'vet/PetHotels/UpdateCheckOut'
    },
    patient: {
        getPatientList: 'vet/Patient/GetPatientList',
        getPatientFindById: 'vet/Patient/GetPatientById',
        getWeightControls: 'vet/Patient/GetWeightControls',
        updatePatientsWeight: 'vet/Patient/UpdatePatientsWeight'
    },
    shortCuts: {
        getShortCuts: 'vet/GeneralSettings/GetShortCuts',
        createShortCuts: 'vet/GeneralSettings/CreateShortCuts',
        updateShortCuts: 'vet/GeneralSettings/UpdateShortCuts',
        deleteShortCuts: 'vet/GeneralSettings/DeleteShortCuts'
    },
    stocktracking: {
        getstockTrackingProductFilter: 'vet/Definition/StockTrackingProductFilter',
        createStockTracking: 'vet/Definition/CreateStockTracking',
        updateStockTracking: 'vet/Definition/UpdateStockTracking',
        deleteStockTracking: 'vet/Definition/DeleteStockTracking'
    },
    smstemplate: {
        getSmsTemplate: 'vet/Definition/GetSmsTemplateList',
        createSmsTemplate: 'vet/Definition/CreateSmsTemplate',
        updateSmsTemplate: 'vet/Definition/UpdateSmsTemplate',
        deleteSmsTemplate: 'vet/Definition/DeleteSmsTemplate',
        getSmsTemplateIdBy: 'vet/Definition/GetSmsTemplateIdBy'
    },
    filemanager: {
        getFileManager: 'vet/FileManager/GetFileManagerList',
        createFileManager: 'vet/FileManager/CreateFileManager',
        deleteFileManager: 'vet/FileManager/DeleteFileManager',
        updateFileManager: '',
        getItemById: 'vet/FileManager/GetFileManagerForById',
        downloadFileManager: 'vet/FileManager/DownloadFileManager'
    },
    printtemplate: {
        getPrintTemplateList: 'vet/Definition/GetPrintTemplateList',
        createPrintTemplate: 'vet/Definition/CreatePrintTemplate',
        getPrintTemplateFilterByType: 'vet/Definition/GetPrintTemplateFilterByType',
        deletePrintTemplate: 'vet/Definition/DeletePrintTemplate',
        updatePrintTemplate: 'vet/Definition/UpdatePrintTemplate'
    },
    message: {
        multiAutoSendMessage: 'vet/Message/MultiAutoSendMessage'
    },
    accounting: {
        isSaleProductControl: 'vet/Accounting/IsSaleProductControl'
    },
    member: {
        createMember: 'gym/Member/CreateGymMember',
        getMemberList: 'gym/Member/GetMembersList' 
    },
    gympersonnel: {
        createGymPersonnel: 'gym/Personnel/CreateGymPersonnel',
        updateGymPersonnel: 'gym/Personnel/UpdateGymPersonnel',
        deleteGymPersonnel: 'gym/Personnel/DeleteGymPersonnel',
        getGymPersonnelList: 'gym/Personnel/GetGymPersonnelList',
        createGymPersonnelPermission: 'gym/Personnel/CreateGymPersonnelPermission',
        updateGymPersonnelPermission: 'gym/Personnel/UpdateGymPersonnelPermission',
        deleteGymPersonnelPermission: 'gym/Personnel/DeleteGymPersonnelPermission',
        getGymPersonnelPermissionList: 'gym/Personnel/GetGymPersonnelPermissionList',
        getPersonnelListLight: 'gym/Personnel/GetGymPersonnelListLight'
    }
}