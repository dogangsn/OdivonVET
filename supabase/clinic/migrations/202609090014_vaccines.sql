alter table public.vetappoointments add column calendar_id uuid references public.vetvaccinecalendar(id);
create unique index appointment_calendar on public.vetappoointments(calendar_id) where not deleted;
create unique index vaccine_calendar_schedule on public.vetvaccinecalendar("patientId","vaccineId","vaccineDate") where not deleted;

create function private.schedule_vaccine(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare patient public.vetpatients;vaccine public.vetvaccine;record jsonb;
begin
 select * into patient from public.vetpatients where id=(payload->>'patientId')::uuid and not deleted for update;
 if not found then raise exception 'Hasta bulunamadı';end if;
 perform private.require_access('clinical',true,patient.branch_id);
 select * into vaccine from public.vetvaccine where id=(payload->>'vaccineId')::uuid and not deleted and branch_id=patient.branch_id;
 if not found or vaccine."animalType"<>patient."animalType" then raise exception 'Aşı ve hasta türü eşleşmiyor';end if;
 if nullif(payload->>'vaccineDate','') is null then raise exception 'Aşı tarihi zorunlu';end if;
 record:=private.save_entity('vetvaccinecalendar',jsonb_build_object('patientId',patient.id,'customerId',patient."customerId",'branch_id',patient.branch_id,'vaccineId',vaccine.id,'vaccineName',vaccine."vaccineName",'animalType',patient."animalType",'vaccineDate',payload->'vaccineDate','isDone',false,'isAdd',true),'create');
 perform private.save_entity('vetappoointments',jsonb_build_object('customerId',patient."customerId",'patientsId',patient.id,'branch_id',patient.branch_id,'vaccineId',vaccine.id,'calendar_id',record->>'id','beginDate',payload->'vaccineDate','endDate',(payload->>'vaccineDate')::timestamptz+interval '30 minutes','note',vaccine."vaccineName",'status',1),'create');
 update public.vetpatients set "isVaccineCalendarCreate"=true where id=patient.id;
 return record;
end;$$;
create function private.vaccine_operation(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare record jsonb;child jsonb;calendar public.vetvaccinecalendar;appointment_id uuid;product public.vetproducts;total numeric:=0;branch uuid;
begin
 if action in ('createvaccine','updatevaccine','detelevaccine') then
  record:=private.save_entity('vetvaccine',payload,case action when 'createvaccine' then 'create' when 'updatevaccine' then 'update' else 'delete' end);
  branch:=(record->>'branch_id')::uuid;
  update public.vetvaccinemedicine set deleted=true where "vaccineId"=(record->>'id')::uuid;
  if action='detelevaccine' then return 'true';end if;
  for child in select value from jsonb_array_elements(coalesce(payload->'vaccineMedicine','[]')) loop
   select * into product from public.vetproducts where id=(child->>'productId')::uuid and not deleted and branch_id=branch;
   if not found or coalesce((child->>'quantity')::numeric,0)<=0 then raise exception 'Geçersiz aşı ürünü veya miktarı';end if;
   perform private.save_entity('vetvaccinemedicine',child||jsonb_build_object('vaccineId',record->>'id','branch_id',branch,'salesAmount',product."sellingPrice"*(child->>'quantity')::numeric),'create');
   total:=total+product."sellingPrice"*(child->>'quantity')::numeric;
  end loop;
  update public.vetvaccine set "totalSaleAmount"=private.round_even(total) where id=(record->>'id')::uuid;
  return 'true';
 elsif action='createvaccineexamination' then
  if coalesce(jsonb_array_length(payload->'vaccineCalendars'),0)=0 then raise exception 'Aşı takvimi boş';end if;
  for child in select value from jsonb_array_elements(payload->'vaccineCalendars') loop perform private.schedule_vaccine(child);end loop;
  return 'true';
 elsif action in ('updatevaccineexamination','detelevaccineappointment') then
  select * into calendar from public.vetvaccinecalendar where id=(payload->>'id')::uuid and not deleted for update;
  if not found then raise exception 'Aşı randevusu bulunamadı';end if;
  perform private.require_access('clinical',true,calendar.branch_id);
  if calendar."isDone" then raise exception 'Tamamlanan aşı kaydı değiştirilemez';end if;
  select id into appointment_id from public.vetappoointments where calendar_id=calendar.id and not deleted;
  if action='detelevaccineappointment' then
   perform private.save_entity('vetvaccinecalendar',payload,'delete');
   if appointment_id is not null then perform private.save_entity('vetappoointments',jsonb_build_object('id',appointment_id),'delete');end if;
  else
   if nullif(payload->>'vaccinationDate','') is null then raise exception 'Uygulama tarihi zorunlu';end if;
   perform private.save_entity('vetvaccinecalendar',payload||jsonb_build_object('isDone',true),'update');
   if appointment_id is not null then perform private.save_entity('vetappoointments',jsonb_build_object('id',appointment_id,'isCompleted',true),'update');end if;
   if coalesce((payload->>'createNextAppointment')::boolean,false) then
    if (payload->>'nextVaccinationDate')::timestamptz<=(payload->>'vaccinationDate')::timestamptz then raise exception 'Sonraki aşı tarihi uygulamadan sonra olmalı';end if;
    perform private.schedule_vaccine(jsonb_build_object('patientId',calendar."patientId",'vaccineId',calendar."vaccineId",'vaccineDate',payload->'nextVaccinationDate'));
   end if;
  end if;
  return 'true';
 end if;
 raise exception 'Tanımsız aşı işlemi';
end;$$;
revoke all on function private.schedule_vaccine(jsonb),private.vaccine_operation(text,jsonb) from public,authenticated;
