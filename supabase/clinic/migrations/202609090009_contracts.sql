-- Explicit enum fields are not primitive CLR properties and need their own mapping.
alter table public.vetaccomodation add column accomodation integer not null default 1;
alter table public.vetappoointments add column status integer not null default 0;
alter table public.vetmessagelogs add column status integer not null default 0;
alter table public.vetprinttemplate add column type integer not null default 0;
alter table public.vetrooms add column "pricingType" integer not null default 1;
alter table public.vetsmstemplate add column type integer not null default 0;
alter table public.vetstocktracking add column "processType" integer not null default 1, add column type integer not null default 1;
alter table public.vetsuppliers add column "invoiceType" integer not null default 0;
alter table public.vetvaccine add column "renewalOption" integer not null default 1 check("renewalOption" between 1 and 16);

alter function private.entity_json(text,jsonb) rename to entity_json_base;
create function private.entity_json(entity text,row_data jsonb) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb; related jsonb; patient uuid; amount numeric;
begin
 result:=private.entity_json_base(entity,row_data);
 -- Legacy DTOs mix camelCase with all-lowercase SQL aliases. Keep both at this boundary.
 select result||coalesce(jsonb_object_agg(lower(key),value),'{}') into result from jsonb_each(result);
 if entity='vetcustomers' then
  result:=result||jsonb_build_object('city',row_data#>>'{adress,province}','district',row_data#>>'{adress,district}','longadress',row_data#>>'{adress,longAdress}');
 elsif entity='vetpatients' then
  select jsonb_build_object('animalTypeName',t.name) into related from public.vetanimalstype t where t.type=(row_data->>'animalType')::int and not t.deleted and private.allowed('definitions',false,t.branch_id) limit 1;
  result:=result||coalesce(related,'{}');
  select jsonb_build_object('breedType',b."breedName") into related from public.vetanimalbreedsdef b where b."recId"=(row_data->>'animalBreed')::int and not b.deleted and private.allowed('definitions',false,b.branch_id) limit 1;
  result:=result||coalesce(related,'{}');
  select jsonb_build_object('animalColorId',c."recId",'animalColor',c.name) into related from public.vetanimalcolorsdef c where c."recId"=(row_data->>'animalColor')::int and not c.deleted and private.allowed('definitions',false,c.branch_id) limit 1;
  result:=result||coalesce(related,'{}');
 elsif entity='vetproducts' then
  select coalesce(sum(quantity),0) into amount from public.stock_ledger where product_id=(row_data->>'id')::uuid and private.allowed('inventory',false,branch_id);
  result:=result||jsonb_build_object('remainingPiece',amount,'stock',amount);
 elsif entity='vetvaccine' then
  result:=result||jsonb_build_object('vaccineMedicine',private.read_entity('vetvaccinemedicine',jsonb_build_object('vaccineId',row_data->>'id')));
 elsif entity='vetsalebuyowner' then
  select coalesce(sum(total),0) into amount from public.vetpaymentcollection where "saleBuyId"=(row_data->>'id')::uuid and not deleted and private.allowed('finance',false,branch_id);
  result:=result||jsonb_build_object('paid',amount,'remainingAmount',coalesce((row_data->>'total')::numeric,0)-amount);
 end if;
 if entity in ('vetappoointments','vetaccomodation') then
  patient:=nullif(row_data->>'patientsId','')::uuid;
  select jsonb_build_object('patientName',name,'patientsName',name) into related from public.vetpatients where id=patient and not deleted and private.allowed('clinical',false,branch_id);
  result:=result||coalesce(related,'{}');
 end if;
 return result;
end;$$;

create function private.read_operation(action text,entity text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; customer public.vetcustomers; target uuid; total_data jsonb; lines jsonb;
begin
 if action='getvetuserslist' then
  perform private.require_access('appointments',false,private.branch());
  return (select coalesce(jsonb_agg(jsonb_build_object('id',id,'firstName',name,'lastName','','name',name)),'[]') from public.profiles where active and (private.is_owner() or branch_id=private.branch()));
 end if;
 if action='getcustomersfindbyid' then
  target:=(payload->>'id')::uuid;
  select * into customer from public.vetcustomers c where c.id=target and not deleted and private.allowed('customers',false,c.branch_id);
  if not found then raise exception 'Müşteri bulunamadı' using errcode='P0002';end if;
  result:=private.entity_json('vetcustomers',to_jsonb(customer));
  result:=result||jsonb_build_object('patientDetails',private.read_entity('vetpatients',jsonb_build_object('customerId',target)));
  total_data:=jsonb_build_object(
   'totalSaleBuyCount',(select count(*) from public.vetsalebuyowner where "customerId"=target and not deleted and private.allowed('finance',false,branch_id)),
   'totalEarnings',(select coalesce(sum(total),0) from public.vetsalebuyowner where "customerId"=target and not deleted and private.allowed('finance',false,branch_id)),
   'totalCollection',(select coalesce(sum(total),0) from public.vetpaymentcollection where "customerId"=target and not deleted and private.allowed('finance',false,branch_id)),
   'totalVisitCount',(select count(*) from public.vetappoointments where "customerId"=target and not deleted and "isCompleted" and "endDate"<=now() and private.allowed('appointments',false,branch_id)),
   'totalMessageCount',(select count(*) from public.vetmessagelogs where "customerId"=target and not deleted and private.allowed('messages',false,branch_id)));
  return result||jsonb_build_object('totalData',total_data);
 end if;
 if action in ('getpatientsbycustomerid','getappointmentlistbypatientid','getexaminationlistbypatientid','getweightcontrols') and payload ? 'id' then
  payload:=(payload-'id')||jsonb_build_object(case when action='getpatientsbycustomerid' then 'customerId' when action='getappointmentlistbypatientid' then 'patientsId' else 'patientId' end,payload->'id');
 end if;
 if coalesce(payload->>'appointmentType','')='0' then payload:=payload-'appointmentType';end if;
 result:=private.read_entity(entity,payload);
 if action in ('getpatientbyid','getexaminationbyrecid','parameterslist','getlabdocumentbyid','getpatientsbyid') then return result->0;end if;
 if action='getsalesbyid' then
  result:=result->0;
  lines:=private.read_entity('vetsalebuytrans',jsonb_build_object('ownerId',result->>'id'));
  return result||jsonb_build_object('trans',lines);
 end if;
 return result;
end;$$;
revoke all on function private.entity_json(text,jsonb),private.read_operation(text,text,jsonb) from public,authenticated;
