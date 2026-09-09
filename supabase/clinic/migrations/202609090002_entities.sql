create table public.vetaccomodation (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "type" integer default 0,
 "roomId" uuid,
 "customerId" uuid,
 "patientsId" uuid,
 "checkinDate" timestamptz,
 "checkOutDate" timestamptz,
 "remark" text default '',
 "isLogOut" boolean default false,
 "isArchive" boolean default false,
 "accomodationcheckOutId" uuid
);

alter table public.vetaccomodation enable row level security;
create policy read_vetaccomodation on public.vetaccomodation for select to authenticated using(not deleted and private.allowed('clinical',false,branch_id));
grant select on public.vetaccomodation to authenticated;
grant all on public.vetaccomodation to service_role;
create trigger audit_vetaccomodation after insert or update or delete on public.vetaccomodation for each row execute function private.audit_change();
create index on public.vetaccomodation(branch_id) where not deleted;

create table public.vetaccomodationcheckouts (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "accomodationId" uuid,
 "checkinDate" timestamptz,
 "checkOutDate" timestamptz,
 "saleBuyId" uuid,
 "accomodationAmount" numeric default 0,
 "collectionAmount" numeric default 0,
 "paymentId" integer default 0
);

alter table public.vetaccomodationcheckouts enable row level security;
create policy read_vetaccomodationcheckouts on public.vetaccomodationcheckouts for select to authenticated using(not deleted and private.allowed('clinical',false,branch_id));
grant select on public.vetaccomodationcheckouts to authenticated;
grant all on public.vetaccomodationcheckouts to service_role;
create trigger audit_vetaccomodationcheckouts after insert or update or delete on public.vetaccomodationcheckouts for each row execute function private.audit_change();
create index on public.vetaccomodationcheckouts(branch_id) where not deleted;

create table public.vetadress (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "province" text default '',
 "district" text default '',
 "county" text default '',
 "longAdress" text default ''
);

alter table public.vetadress enable row level security;
create policy read_vetadress on public.vetadress for select to authenticated using(not deleted and private.allowed('customers',false,branch_id));
grant select on public.vetadress to authenticated;
grant all on public.vetadress to service_role;
create trigger audit_vetadress after insert or update or delete on public.vetadress for each row execute function private.audit_change();
create index on public.vetadress(branch_id) where not deleted;

create table public.vetagenda (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "agendaNo" integer default 0,
 "agendaType" integer default 0,
 "isActive" integer default 0,
 "agendaTitle" text default '',
 "priority" integer default 0,
 "dueDate" timestamptz,
 "notes" text default ''
);

alter table public.vetagenda enable row level security;
create policy read_vetagenda on public.vetagenda for select to authenticated using(not deleted and private.allowed('appointments',false,branch_id));
grant select on public.vetagenda to authenticated;
grant all on public.vetagenda to service_role;
create trigger audit_vetagenda after insert or update or delete on public.vetagenda for each row execute function private.audit_change();
create index on public.vetagenda(branch_id) where not deleted;

create table public.vetagendatags (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "agendaId" uuid,
 "tagsId" uuid,
 "tags" text default ''
);

alter table public.vetagendatags enable row level security;
create policy read_vetagendatags on public.vetagendatags for select to authenticated using(not deleted and private.allowed('appointments',false,branch_id));
grant select on public.vetagendatags to authenticated;
grant all on public.vetagendatags to service_role;
create trigger audit_vetagendatags after insert or update or delete on public.vetagendatags for each row execute function private.audit_change();
create index on public.vetagendatags(branch_id) where not deleted;

create table public.vetanimalbreedsdef (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "animalType" integer default 0,
 "breedName" text default ''
);

alter table public.vetanimalbreedsdef enable row level security;
create policy read_vetanimalbreedsdef on public.vetanimalbreedsdef for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetanimalbreedsdef to authenticated;
grant all on public.vetanimalbreedsdef to service_role;
create trigger audit_vetanimalbreedsdef after insert or update or delete on public.vetanimalbreedsdef for each row execute function private.audit_change();
create index on public.vetanimalbreedsdef(branch_id) where not deleted;

create table public.vetanimalcolorsdef (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "name" text default ''
);

alter table public.vetanimalcolorsdef enable row level security;
create policy read_vetanimalcolorsdef on public.vetanimalcolorsdef for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetanimalcolorsdef to authenticated;
grant all on public.vetanimalcolorsdef to service_role;
create trigger audit_vetanimalcolorsdef after insert or update or delete on public.vetanimalcolorsdef for each row execute function private.audit_change();
create index on public.vetanimalcolorsdef(branch_id) where not deleted;

create table public.vetanimalstype (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "type" integer default 0,
 "name" text default '',
 "description" text default ''
);

alter table public.vetanimalstype enable row level security;
create policy read_vetanimalstype on public.vetanimalstype for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetanimalstype to authenticated;
grant all on public.vetanimalstype to service_role;
create trigger audit_vetanimalstype after insert or update or delete on public.vetanimalstype for each row execute function private.audit_change();
create index on public.vetanimalstype(branch_id) where not deleted;

create table public.vetappointmenttypes (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "type" integer default 0,
 "remark" text default '',
 "isChange" boolean default false,
 "isDefaultPrice" boolean default false,
 "price" numeric default 0,
 "taxisId" uuid,
 "colors" text default ''
);

alter table public.vetappointmenttypes enable row level security;
create policy read_vetappointmenttypes on public.vetappointmenttypes for select to authenticated using(not deleted and private.allowed('appointments',false,branch_id));
grant select on public.vetappointmenttypes to authenticated;
grant all on public.vetappointmenttypes to service_role;
create trigger audit_vetappointmenttypes after insert or update or delete on public.vetappointmenttypes for each row execute function private.audit_change();
create index on public.vetappointmenttypes(branch_id) where not deleted;

create table public.vetappoointments (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "beginDate" timestamptz,
 "endDate" timestamptz,
 "note" text default '',
 "doctorId" uuid,
 "customerId" uuid,
 "patientsId" uuid,
 "appointmentType" integer default 0,
 "isCompleted" boolean default false,
 "vaccineId" uuid,
 "isPaymentReceived" boolean default false,
 "isMessage" boolean default false
);

alter table public.vetappoointments enable row level security;
create policy read_vetappoointments on public.vetappoointments for select to authenticated using(not deleted and private.allowed('appointments',false,branch_id));
grant select on public.vetappoointments to authenticated;
grant all on public.vetappoointments to service_role;
create trigger audit_vetappoointments after insert or update or delete on public.vetappoointments for each row execute function private.audit_change();
create index on public.vetappoointments(branch_id) where not deleted;

create table public.vetcasingdefinition (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "caseName" text default '',
 "active" boolean default false,
 "kasa" text default '',
 "durumu" boolean default false
);

alter table public.vetcasingdefinition enable row level security;
create policy read_vetcasingdefinition on public.vetcasingdefinition for select to authenticated using(not deleted and private.allowed('finance',false,branch_id));
grant select on public.vetcasingdefinition to authenticated;
grant all on public.vetcasingdefinition to service_role;
create trigger audit_vetcasingdefinition after insert or update or delete on public.vetcasingdefinition for each row execute function private.audit_change();
create index on public.vetcasingdefinition(branch_id) where not deleted;

create table public.vetcustomergroupdef (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "code" text default '',
 "name" text default ''
);

alter table public.vetcustomergroupdef enable row level security;
create policy read_vetcustomergroupdef on public.vetcustomergroupdef for select to authenticated using(not deleted and private.allowed('customers',false,branch_id));
grant select on public.vetcustomergroupdef to authenticated;
grant all on public.vetcustomergroupdef to service_role;
create trigger audit_vetcustomergroupdef after insert or update or delete on public.vetcustomergroupdef for each row execute function private.audit_change();
create index on public.vetcustomergroupdef(branch_id) where not deleted;

create table public.vetcustomers (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "firstName" text default '',
 "lastName" text default '',
 "phoneNumber" text default '',
 "phoneNumber2" text default '',
 "eMail" text default '',
 "taxOffice" text default '',
 "vKNTCNo" text default '',
 "customerGroup" uuid,
 "note" text default '',
 "discountRate" numeric default 0,
 "isEmail" boolean default false,
 "isPhone" boolean default false,
 "isArchive" boolean default false,
 adress jsonb not null default '{}'::jsonb
);

alter table public.vetcustomers enable row level security;
create policy read_vetcustomers on public.vetcustomers for select to authenticated using(not deleted and private.allowed('customers',false,branch_id));
grant select on public.vetcustomers to authenticated;
grant all on public.vetcustomers to service_role;
create trigger audit_vetcustomers after insert or update or delete on public.vetcustomers for each row execute function private.audit_change();
create index on public.vetcustomers(branch_id) where not deleted;

create table public.vetdemandproducts (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "ownerId" uuid,
 "productId" uuid,
 "quantity" numeric default 0,
 "unitPrice" numeric default 0,
 "amount" numeric default 0,
 "stockState" numeric default 0,
 "isActive" integer default 0,
 "reserved" numeric default 0,
 "barcode" text default '',
 "taxisId" uuid
);

alter table public.vetdemandproducts enable row level security;
create policy read_vetdemandproducts on public.vetdemandproducts for select to authenticated using(not deleted and private.allowed('inventory',false,branch_id));
grant select on public.vetdemandproducts to authenticated;
grant all on public.vetdemandproducts to service_role;
create trigger audit_vetdemandproducts after insert or update or delete on public.vetdemandproducts for each row execute function private.audit_change();
create index on public.vetdemandproducts(branch_id) where not deleted;

create table public.vetdemands (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "date" timestamptz,
 "documentno" text default '',
 "suppliers" uuid,
 "deliverydate" timestamptz,
 "note" text default '',
 "state" integer default 0,
 "isBuying" boolean default false,
 "isAccounting" boolean default false,
 "iscomplated" boolean default false
);

alter table public.vetdemands enable row level security;
create policy read_vetdemands on public.vetdemands for select to authenticated using(not deleted and private.allowed('inventory',false,branch_id));
grant select on public.vetdemands to authenticated;
grant all on public.vetdemands to service_role;
create trigger audit_vetdemands after insert or update or delete on public.vetdemands for each row execute function private.audit_change();
create index on public.vetdemands(branch_id) where not deleted;

create table public.vetdemandtrans (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "ownerId" uuid,
 "productId" uuid,
 "quantity" numeric default 0,
 "unitPrice" numeric default 0,
 "amount" numeric default 0,
 "stockState" numeric default 0,
 "isActive" integer default 0,
 "reserved" numeric default 0,
 "barcode" text default '',
 "taxisId" uuid
);

alter table public.vetdemandtrans enable row level security;
create policy read_vetdemandtrans on public.vetdemandtrans for select to authenticated using(not deleted and private.allowed('inventory',false,branch_id));
grant select on public.vetdemandtrans to authenticated;
grant all on public.vetdemandtrans to service_role;
create trigger audit_vetdemandtrans after insert or update or delete on public.vetdemandtrans for each row execute function private.audit_change();
create index on public.vetdemandtrans(branch_id) where not deleted;

create table public.vetdocuments (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "sourceId" uuid,
 "fileName" text default '',
 "fileData" bytea,
 "size" text default '',
 "remark" text default ''
);

alter table public.vetdocuments enable row level security;
create policy read_vetdocuments on public.vetdocuments for select to authenticated using(not deleted and private.allowed('files',false,branch_id));
grant select on public.vetdocuments to authenticated;
grant all on public.vetdocuments to service_role;
create trigger audit_vetdocuments after insert or update or delete on public.vetdocuments for each row execute function private.audit_change();
create index on public.vetdocuments(branch_id) where not deleted;

create table public.vetexamination (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "date" timestamptz,
 "status" integer default 0,
 "customerId" uuid,
 "patientId" uuid,
 "bodyTemperature" numeric default 0,
 "pulse" numeric default 0,
 "respiratoryRate" numeric default 0,
 "weight" numeric default 0,
 "symptoms" text default '',
 "complaintStory" text default '',
 "treatmentDescription" text default ''
);

alter table public.vetexamination enable row level security;
create policy read_vetexamination on public.vetexamination for select to authenticated using(not deleted and private.allowed('clinical',false,branch_id));
grant select on public.vetexamination to authenticated;
grant all on public.vetexamination to service_role;
create trigger audit_vetexamination after insert or update or delete on public.vetexamination for each row execute function private.audit_change();
create index on public.vetexamination(branch_id) where not deleted;

create table public.vetfarms (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "customerId" uuid,
 "farmName" text default '',
 "farmContact" text default '',
 "farmRelationship" text default '',
 "active" boolean default false
);

alter table public.vetfarms enable row level security;
create policy read_vetfarms on public.vetfarms for select to authenticated using(not deleted and private.allowed('customers',false,branch_id));
grant select on public.vetfarms to authenticated;
grant all on public.vetfarms to service_role;
create trigger audit_vetfarms after insert or update or delete on public.vetfarms for each row execute function private.audit_change();
create index on public.vetfarms(branch_id) where not deleted;

create table public.vetlabdocument (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "customerId" uuid,
 "patientId" uuid,
 "isRead" boolean default false,
 "fileName" text default '',
 "fileData" bytea,
 "remark" text default ''
);

alter table public.vetlabdocument enable row level security;
create policy read_vetlabdocument on public.vetlabdocument for select to authenticated using(not deleted and private.allowed('files',false,branch_id));
grant select on public.vetlabdocument to authenticated;
grant all on public.vetlabdocument to service_role;
create trigger audit_vetlabdocument after insert or update or delete on public.vetlabdocument for each row execute function private.audit_change();
create index on public.vetlabdocument(branch_id) where not deleted;

create table public.vetlogs (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "date" timestamptz,
 "userId" uuid,
 "userName" text default '',
 "oldValue" text default '',
 "newValue" text default '',
 "fieldName" text default '',
 "tenantId" uuid,
 "tableName" text default '',
 "masterId" text default ''
);

alter table public.vetlogs enable row level security;
create policy read_vetlogs on public.vetlogs for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetlogs to authenticated;
grant all on public.vetlogs to service_role;
create trigger audit_vetlogs after insert or update or delete on public.vetlogs for each row execute function private.audit_change();
create index on public.vetlogs(branch_id) where not deleted;

create table public.vetmessagelogs (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "sendDate" timestamptz,
 "userİd" uuid,
 "customerId" uuid,
 "content" text default '',
 "itenrationType" integer default 0,
 "integrationId" uuid
);

alter table public.vetmessagelogs enable row level security;
create policy read_vetmessagelogs on public.vetmessagelogs for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetmessagelogs to authenticated;
grant all on public.vetmessagelogs to service_role;
create trigger audit_vetmessagelogs after insert or update or delete on public.vetmessagelogs for each row execute function private.audit_change();
create index on public.vetmessagelogs(branch_id) where not deleted;

create table public.vetparameters (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "appointmentReminderDuration" integer default 0,
 "agendaNoteReminder" integer default 0,
 "days" text default '',
 "smsCompany" uuid,
 "cashAccount" uuid,
 "creditCardCashAccount" uuid,
 "bankTransferCashAccount" uuid,
 "whatsappTemplate" uuid,
 "customerWelcomeTemplate" uuid,
 "automaticAppointmentReminderMessageTemplate" uuid,
 "isOtoCustomerWelcomeMessage" boolean default false,
 "displayVetNo" boolean default false,
 "autoSms" boolean default false,
 "isAnimalsBreeds" boolean default false,
 "isFirstInspection" boolean default false,
 "appointmentBeginDate" text default '',
 "appointmentEndDate" text default '',
 "isExaminationAmuntZero" boolean default false,
 "datetimeStatus" integer default 0,
 "appointmentInterval" integer default 0,
 "appointmentSeansDuration" integer default 0,
 "petHotelsDateTimeFormat" integer default 0
);

alter table public.vetparameters enable row level security;
create policy read_vetparameters on public.vetparameters for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetparameters to authenticated;
grant all on public.vetparameters to service_role;
create trigger audit_vetparameters after insert or update or delete on public.vetparameters for each row execute function private.audit_change();
create index on public.vetparameters(branch_id) where not deleted;

create table public.vetpatients (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "customerId" uuid,
 "name" text default '',
 "birthDate" timestamptz,
 "chipNumber" text default '',
 "sex" integer default 0,
 "animalType" integer default 0,
 "animalBreed" integer default 0,
 "animalColor" integer default 0,
 "reportNumber" text default '',
 "specialNote" text default '',
 "sterilization" boolean default false,
 "images" integer default 0,
 "active" boolean default false,
 "isVaccineCalendarCreate" boolean default false
);

alter table public.vetpatients enable row level security;
create policy read_vetpatients on public.vetpatients for select to authenticated using(not deleted and private.allowed('clinical',false,branch_id));
grant select on public.vetpatients to authenticated;
grant all on public.vetpatients to service_role;
create trigger audit_vetpatients after insert or update or delete on public.vetpatients for each row execute function private.audit_change();
create index on public.vetpatients(branch_id) where not deleted;

create table public.vetpaymentcollection (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "customerId" uuid,
 "collectionId" uuid,
 "date" timestamptz,
 "remark" text default '',
 "debit" numeric default 0,
 "credit" numeric default 0,
 "paid" numeric default 0,
 "totalPaid" numeric default 0,
 "total" numeric default 0,
 "saleBuyId" uuid,
 "paymetntId" integer default 0
);

alter table public.vetpaymentcollection enable row level security;
create policy read_vetpaymentcollection on public.vetpaymentcollection for select to authenticated using(not deleted and private.allowed('finance',false,branch_id));
grant select on public.vetpaymentcollection to authenticated;
grant all on public.vetpaymentcollection to service_role;
create trigger audit_vetpaymentcollection after insert or update or delete on public.vetpaymentcollection for each row execute function private.audit_change();
create index on public.vetpaymentcollection(branch_id) where not deleted;

create table public.vetpaymentmethods (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "name" text default '',
 "remark" text default ''
);

alter table public.vetpaymentmethods enable row level security;
create policy read_vetpaymentmethods on public.vetpaymentmethods for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetpaymentmethods to authenticated;
grant all on public.vetpaymentmethods to service_role;
create trigger audit_vetpaymentmethods after insert or update or delete on public.vetpaymentmethods for each row execute function private.audit_change();
create index on public.vetpaymentmethods(branch_id) where not deleted;

create table public.vetprinttemplate (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "templateName" text default '',
 "htmlContent" text default ''
);

alter table public.vetprinttemplate enable row level security;
create policy read_vetprinttemplate on public.vetprinttemplate for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetprinttemplate to authenticated;
grant all on public.vetprinttemplate to service_role;
create trigger audit_vetprinttemplate after insert or update or delete on public.vetprinttemplate for each row execute function private.audit_change();
create index on public.vetprinttemplate(branch_id) where not deleted;

create table public.vetproductcategories (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "name" text default '',
 "categoryCode" text default ''
);

alter table public.vetproductcategories enable row level security;
create policy read_vetproductcategories on public.vetproductcategories for select to authenticated using(not deleted and private.allowed('inventory',false,branch_id));
grant select on public.vetproductcategories to authenticated;
grant all on public.vetproductcategories to service_role;
create trigger audit_vetproductcategories after insert or update or delete on public.vetproductcategories for each row execute function private.audit_change();
create index on public.vetproductcategories(branch_id) where not deleted;

create table public.vetproductmovements (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "type" integer default 0,
 "invoiceNo" text default '',
 "date" timestamptz,
 "totalAmount" numeric default 0,
 "quantity" integer default 0,
 "depotId" uuid
);

alter table public.vetproductmovements enable row level security;
create policy read_vetproductmovements on public.vetproductmovements for select to authenticated using(not deleted and private.allowed('inventory',false,branch_id));
grant select on public.vetproductmovements to authenticated;
grant all on public.vetproductmovements to service_role;
create trigger audit_vetproductmovements after insert or update or delete on public.vetproductmovements for each row execute function private.audit_change();
create index on public.vetproductmovements(branch_id) where not deleted;

create table public.vetproducts (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "name" text default '',
 "productTypeId" integer default 0,
 "unitId" uuid,
 "categoryId" uuid,
 "supplierId" uuid,
 "productBarcode" text default '',
 "productCode" text default '',
 "ratio" numeric default 0,
 "buyingPrice" numeric default 0,
 "sellingPrice" numeric default 0,
 "criticalAmount" numeric default 0,
 "active" boolean default false,
 "sellingIncludeKDV" boolean default false,
 "buyingIncludeKDV" boolean default false,
 "fixPrice" boolean default false,
 "isExpirationDate" boolean default false,
 "animalType" integer default 0,
 "numberRepetitions" integer default 0,
 "storeId" uuid,
 "taxisId" uuid
);

alter table public.vetproducts enable row level security;
create policy read_vetproducts on public.vetproducts for select to authenticated using(not deleted and private.allowed('inventory',false,branch_id));
grant select on public.vetproducts to authenticated;
grant all on public.vetproducts to service_role;
create trigger audit_vetproducts after insert or update or delete on public.vetproducts for each row execute function private.audit_change();
create index on public.vetproducts(branch_id) where not deleted;

create table public.vetrenewaloptions (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "remark" text default ''
);

alter table public.vetrenewaloptions enable row level security;
create policy read_vetrenewaloptions on public.vetrenewaloptions for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetrenewaloptions to authenticated;
grant all on public.vetrenewaloptions to service_role;
create trigger audit_vetrenewaloptions after insert or update or delete on public.vetrenewaloptions for each row execute function private.audit_change();
create index on public.vetrenewaloptions(branch_id) where not deleted;

create table public.vetreportfilter (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "enterprisesId" uuid,
 "name" text default '',
 "filterJson" text default ''
);

alter table public.vetreportfilter enable row level security;
create policy read_vetreportfilter on public.vetreportfilter for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetreportfilter to authenticated;
grant all on public.vetreportfilter to service_role;
create trigger audit_vetreportfilter after insert or update or delete on public.vetreportfilter for each row execute function private.audit_change();
create index on public.vetreportfilter(branch_id) where not deleted;

create table public.vetrooms (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "roomName" text default '',
 "price" numeric default 0
);

alter table public.vetrooms enable row level security;
create policy read_vetrooms on public.vetrooms for select to authenticated using(not deleted and private.allowed('clinical',false,branch_id));
grant select on public.vetrooms to authenticated;
grant all on public.vetrooms to service_role;
create trigger audit_vetrooms after insert or update or delete on public.vetrooms for each row execute function private.audit_change();
create index on public.vetrooms(branch_id) where not deleted;

create table public.vetsalebuyowner (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "type" integer default 0,
 "customerId" uuid,
 "date" timestamptz,
 "invoiceNo" text default '',
 "paymentType" integer default 0,
 "total" numeric default 0,
 "discount" numeric default 0,
 "kDV" numeric default 0,
 "netPrice" numeric default 0,
 "supplierId" uuid,
 "remark" text default '',
 "demandsGuidId" uuid,
 "isAppointment" boolean default false,
 "appointmentId" uuid,
 "isExaminations" boolean default false,
 "examinationsId" uuid,
 "isAccomodation" boolean default false,
 "accomodationId" uuid
);

alter table public.vetsalebuyowner enable row level security;
create policy read_vetsalebuyowner on public.vetsalebuyowner for select to authenticated using(not deleted and private.allowed('finance',false,branch_id));
grant select on public.vetsalebuyowner to authenticated;
grant all on public.vetsalebuyowner to service_role;
create trigger audit_vetsalebuyowner after insert or update or delete on public.vetsalebuyowner for each row execute function private.audit_change();
create index on public.vetsalebuyowner(branch_id) where not deleted;

create table public.vetsalebuytrans (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "ownerId" uuid,
 "productId" uuid,
 "ratio" numeric default 0,
 "amount" numeric default 0,
 "discount" numeric default 0,
 "price" numeric default 0,
 "netPrice" numeric default 0,
 "invoiceNo" text default '',
 "vatIncluded" boolean default false,
 "vatAmount" numeric default 0,
 "orderId" uuid,
 "quantity" integer default 0,
 "taxisId" uuid,
 "isNew" boolean default false
);

alter table public.vetsalebuytrans enable row level security;
create policy read_vetsalebuytrans on public.vetsalebuytrans for select to authenticated using(not deleted and private.allowed('finance',false,branch_id));
grant select on public.vetsalebuytrans to authenticated;
grant all on public.vetsalebuytrans to service_role;
create trigger audit_vetsalebuytrans after insert or update or delete on public.vetsalebuytrans for each row execute function private.audit_change();
create index on public.vetsalebuytrans(branch_id) where not deleted;

create table public.vetshortcuts (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "label" text default '',
 "description" text default '',
 "icon" text default '',
 "link" text default '',
 "useRouter" boolean default false
);

alter table public.vetshortcuts enable row level security;
create policy read_vetshortcuts on public.vetshortcuts for select to authenticated using(not deleted and private.allowed('appointments',false,branch_id));
grant select on public.vetshortcuts to authenticated;
grant all on public.vetshortcuts to service_role;
create trigger audit_vetshortcuts after insert or update or delete on public.vetshortcuts for each row execute function private.audit_change();
create index on public.vetshortcuts(branch_id) where not deleted;

create table public.vetsmsparameters (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "active" boolean default false,
 "smsIntegrationType" integer default 0,
 "userName" text default '',
 "password" text default ''
);

alter table public.vetsmsparameters enable row level security;
create policy read_vetsmsparameters on public.vetsmsparameters for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetsmsparameters to authenticated;
grant all on public.vetsmsparameters to service_role;
create trigger audit_vetsmsparameters after insert or update or delete on public.vetsmsparameters for each row execute function private.audit_change();
create index on public.vetsmsparameters(branch_id) where not deleted;

create table public.vetsmstemplate (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "active" boolean default false,
 "name" text default '',
 "content" text default '',
 "enableSMS" boolean default false,
 "enableAppNotification" boolean default false,
 "enableEmail" boolean default false,
 "enableWhatsapp" boolean default false
);

alter table public.vetsmstemplate enable row level security;
create policy read_vetsmstemplate on public.vetsmstemplate for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetsmstemplate to authenticated;
grant all on public.vetsmstemplate to service_role;
create trigger audit_vetsmstemplate after insert or update or delete on public.vetsmstemplate for each row execute function private.audit_change();
create index on public.vetsmstemplate(branch_id) where not deleted;

create table public.vetstocktracking (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "productId" uuid,
 "status" boolean default false,
 "piece" numeric default 0,
 "usedPiece" numeric default 0,
 "remainingPiece" numeric default 0,
 "supplierId" uuid,
 "expirationDate" timestamptz,
 "salePrice" numeric default 0,
 "purchasePrice" numeric default 0,
 "unitId" uuid
);

alter table public.vetstocktracking enable row level security;
create policy read_vetstocktracking on public.vetstocktracking for select to authenticated using(not deleted and private.allowed('inventory',false,branch_id));
grant select on public.vetstocktracking to authenticated;
grant all on public.vetstocktracking to service_role;
create trigger audit_vetstocktracking after insert or update or delete on public.vetstocktracking for each row execute function private.audit_change();
create index on public.vetstocktracking(branch_id) where not deleted;

create table public.vetstores (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "active" boolean default false,
 "depotCode" text default '',
 "depotName" text default ''
);

alter table public.vetstores enable row level security;
create policy read_vetstores on public.vetstores for select to authenticated using(not deleted and private.allowed('inventory',false,branch_id));
grant select on public.vetstores to authenticated;
grant all on public.vetstores to service_role;
create trigger audit_vetstores after insert or update or delete on public.vetstores for each row execute function private.audit_change();
create index on public.vetstores(branch_id) where not deleted;

create table public.vetsuppliers (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "supplierName" text default '',
 "email" text default '',
 "phone" text default '',
 "adress" text default '',
 "companyName" text default '',
 "mersisNo" text default '',
 "webSite" text default '',
 "taxOffice" text default '',
 "taxNumber" text default '',
 "active" boolean default false
);

alter table public.vetsuppliers enable row level security;
create policy read_vetsuppliers on public.vetsuppliers for select to authenticated using(not deleted and private.allowed('inventory',false,branch_id));
grant select on public.vetsuppliers to authenticated;
grant all on public.vetsuppliers to service_role;
create trigger audit_vetsuppliers after insert or update or delete on public.vetsuppliers for each row execute function private.audit_change();
create index on public.vetsuppliers(branch_id) where not deleted;

create table public.vetsymptoms (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "symptom" text default ''
);

alter table public.vetsymptoms enable row level security;
create policy read_vetsymptoms on public.vetsymptoms for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetsymptoms to authenticated;
grant all on public.vetsymptoms to service_role;
create trigger audit_vetsymptoms after insert or update or delete on public.vetsymptoms for each row execute function private.audit_change();
create index on public.vetsymptoms(branch_id) where not deleted;

create table public.vettaxis (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "type" integer default 0,
 "taxName" text default '',
 "taxRatio" integer default 0
);

alter table public.vettaxis enable row level security;
create policy read_vettaxis on public.vettaxis for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vettaxis to authenticated;
grant all on public.vettaxis to service_role;
create trigger audit_vettaxis after insert or update or delete on public.vettaxis for each row execute function private.audit_change();
create index on public.vettaxis(branch_id) where not deleted;

create table public.vetunits (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "unitCode" text default '',
 "unitName" text default ''
);

alter table public.vetunits enable row level security;
create policy read_vetunits on public.vetunits for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetunits to authenticated;
grant all on public.vetunits to service_role;
create trigger audit_vetunits after insert or update or delete on public.vetunits for each row execute function private.audit_change();
create index on public.vetunits(branch_id) where not deleted;

create table public.vetvaccine (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "animalType" integer default 0,
 "vaccineName" text default '',
 "timeDone" integer default 0,
 "obligation" integer default 0,
 "totalSaleAmount" numeric default 0
);

alter table public.vetvaccine enable row level security;
create policy read_vetvaccine on public.vetvaccine for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetvaccine to authenticated;
grant all on public.vetvaccine to service_role;
create trigger audit_vetvaccine after insert or update or delete on public.vetvaccine for each row execute function private.audit_change();
create index on public.vetvaccine(branch_id) where not deleted;

create table public.vetvaccinecalendar (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "animalType" integer default 0,
 "vaccineDate" timestamptz,
 "vaccinationDate" timestamptz,
 "isDone" boolean default false,
 "isAdd" boolean default false,
 "patientId" uuid,
 "customerId" uuid,
 "vaccineId" uuid,
 "vaccineName" text default ''
);

alter table public.vetvaccinecalendar enable row level security;
create policy read_vetvaccinecalendar on public.vetvaccinecalendar for select to authenticated using(not deleted and private.allowed('clinical',false,branch_id));
grant select on public.vetvaccinecalendar to authenticated;
grant all on public.vetvaccinecalendar to service_role;
create trigger audit_vetvaccinecalendar after insert or update or delete on public.vetvaccinecalendar for each row execute function private.audit_change();
create index on public.vetvaccinecalendar(branch_id) where not deleted;

create table public.vetvaccinemedicine (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "vaccineId" uuid,
 "productId" uuid,
 "quantity" integer default 0,
 "salesAmount" numeric default 0,
 "taxisId" uuid,
 "dosingType" integer default 0,
 "remark" text default ''
);

alter table public.vetvaccinemedicine enable row level security;
create policy read_vetvaccinemedicine on public.vetvaccinemedicine for select to authenticated using(not deleted and private.allowed('definitions',false,branch_id));
grant select on public.vetvaccinemedicine to authenticated;
grant all on public.vetvaccinemedicine to service_role;
create trigger audit_vetvaccinemedicine after insert or update or delete on public.vetvaccinemedicine for each row execute function private.audit_change();
create index on public.vetvaccinemedicine(branch_id) where not deleted;

create table public.vetweightcontrol (
 id uuid primary key default gen_random_uuid(),
 "recId" bigint generated always as identity unique,
 branch_id uuid references public.branches(id) default private.branch(),
 "createDate" timestamptz not null default now(),
 "updateDate" timestamptz not null default now(),
 deleted boolean not null default false,
 "patientId" uuid,
 "weight" numeric default 0,
 "controlDate" timestamptz
);

alter table public.vetweightcontrol enable row level security;
create policy read_vetweightcontrol on public.vetweightcontrol for select to authenticated using(not deleted and private.allowed('clinical',false,branch_id));
grant select on public.vetweightcontrol to authenticated;
grant all on public.vetweightcontrol to service_role;
create trigger audit_vetweightcontrol after insert or update or delete on public.vetweightcontrol for each row execute function private.audit_change();
create index on public.vetweightcontrol(branch_id) where not deleted;