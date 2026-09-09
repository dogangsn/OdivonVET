-- Keep the retained calendar form's patientId and vaccineItems contract atomic.
create function private.appointment_operation(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare old public.vetappoointments; patient public.vetpatients; vaccine public.vetvaccine; item jsonb; record jsonb; cal jsonb; minutes integer; starts timestamptz; doctor uuid; kind integer; branch uuid;
begin
 if action<>'createappointment' then
  select * into old from public.vetappoointments where id=(payload->>'id')::uuid and not deleted for update;
  if not found then raise exception 'Randevu bulunamadı';end if;
  perform private.require_access('appointments',true,old.branch_id);
  if action='deleteappointment' then
   if old.calendar_id is not null then perform private.vaccine_operation('detelevaccineappointment',jsonb_build_object('id',old.calendar_id));
   else perform private.save_entity('vetappoointments',payload,'delete');end if;
   return 'true';
  end if;
  if action in ('updatecompletedappointment','updateappointmentstatus','updatepaymentreceivedappointment') then
   if action='updatecompletedappointment' then
    if old.calendar_id is not null then
     if not coalesce((payload->>'isCompleted')::boolean,(payload->>'isComplated')::boolean,false) then raise exception 'Uygulanmış aşı takvimden geri alınamaz';end if;
     perform private.vaccine_operation('updatevaccineexamination',jsonb_build_object('id',old.calendar_id,'vaccinationDate',now()));
     return 'true';
    end if;
    payload:=jsonb_build_object('id',old.id,'isCompleted',coalesce((payload->>'isCompleted')::boolean,(payload->>'isComplated')::boolean,true));
   elsif action='updateappointmentstatus' then
    if (payload->>'status')::int not between 1 and 4 or payload->>'status' is null then raise exception 'Geçersiz randevu durumu';end if;
    payload:=jsonb_build_object('id',old.id,'status',payload->'status');
   else
    perform private.require_access('finance',true,old.branch_id);
    payload:=jsonb_build_object('id',old.id,'isPaymentReceived',coalesce((payload->>'isPaymentReceived')::boolean,true));
   end if;
   return private.save_entity('vetappoointments',payload,'update');
  end if;
  if old.calendar_id is not null and exists(select 1 from public.vetvaccinecalendar where id=old.calendar_id and "isDone") then raise exception 'Uygulanmış aşı randevusu değiştirilemez';end if;
 end if;
 select * into patient from public.vetpatients where id=coalesce(nullif(payload->>'patientId','')::uuid,nullif(payload->>'patientsId','')::uuid,old."patientsId") and not deleted;
 if not found then raise exception 'Hasta seçin';end if;
 branch:=coalesce(old.branch_id,patient.branch_id);
 perform private.require_access('appointments',true,branch);
 if patient.branch_id<>branch or (nullif(payload->>'customerId','') is not null and (payload->>'customerId')::uuid<>patient."customerId") then raise exception 'Hasta, müşteri ve şube eşleşmiyor';end if;
 doctor:=nullif(nullif(payload->>'doctorId',''),'00000000-0000-0000-0000-000000000000')::uuid;
 if doctor is not null and not exists(select 1 from public.profiles where id=doctor and active and branch_id=branch and role in ('owner','vet')) then raise exception 'Bu şubede aktif hekim seçin';end if;
 select coalesce(nullif("appointmentSeansDuration",0),30) into minutes from public.vetparameters where branch_id=branch and not deleted order by "recId" limit 1;
 minutes:=coalesce(minutes,30);
 if minutes not between 1 and 480 then raise exception 'Randevu süresi 1–480 dakika olmalı';end if;
 kind:=coalesce((payload->>'appointmentType')::int,old."appointmentType",0);
 starts:=nullif(payload->>'beginDate','')::timestamptz;
 if starts is null then raise exception 'Randevu tarihi zorunlu';end if;
 payload:=payload||jsonb_build_object('patientsId',patient.id,'customerId',patient."customerId",'doctorId',doctor,'branch_id',branch,'appointmentType',kind,'status',coalesce((payload->>'status')::int,old.status,1),'endDate',starts+make_interval(mins=>minutes));
 if (payload->>'status')::int not between 1 and 4 then raise exception 'Geçersiz randevu durumu';end if;
 if kind=1 then
  if jsonb_typeof(payload->'vaccineItems') is distinct from 'array' or jsonb_array_length(payload->'vaccineItems')=0 then raise exception 'Aşı seçin';end if;
  if action='updateappointment' and jsonb_array_length(payload->'vaccineItems')<>1 then raise exception 'Tek randevuda tek aşı güncellenebilir';end if;
  for item in select value from jsonb_array_elements(payload->'vaccineItems') loop
   select * into vaccine from public.vetvaccine where id=(item->>'productId')::uuid and not deleted and branch_id=branch and "animalType"=patient."animalType";
   if not found then raise exception 'Aşı ve hasta türü eşleşmiyor';end if;
   if action='createappointment' then starts:=coalesce(nullif(item->>'date','')::timestamptz,starts);end if;
   if old.calendar_id is null then
    cal:=private.schedule_vaccine(jsonb_build_object('patientId',patient.id,'vaccineId',vaccine.id,'vaccineDate',starts));
    select to_jsonb(a) into record from public.vetappoointments a where calendar_id=(cal->>'id')::uuid and not deleted;
    -- Converting an ordinary appointment uses its existing identity.
    if action='updateappointment' then
     perform private.save_entity('vetappoointments',jsonb_build_object('id',record->>'id'),'delete');
     record:=jsonb_build_object('id',old.id);
    end if;
   else
    cal:=private.save_entity('vetvaccinecalendar',jsonb_build_object('id',old.calendar_id,'patientId',patient.id,'customerId',patient."customerId",'vaccineId',vaccine.id,'vaccineName',vaccine."vaccineName",'animalType',patient."animalType",'vaccineDate',starts),'update');
    record:=jsonb_build_object('id',old.id);
   end if;
   perform private.save_entity('vetappoointments',payload||jsonb_build_object('id',record->>'id','calendar_id',cal->>'id','vaccineId',vaccine.id,'beginDate',starts,'endDate',starts+make_interval(mins=>minutes)),'update');
  end loop;
 else
  if old.calendar_id is not null then perform private.save_entity('vetvaccinecalendar',jsonb_build_object('id',old.calendar_id),'delete');end if;
  perform private.save_entity('vetappoointments',payload||jsonb_build_object('calendar_id',null,'vaccineId',null),case when action='createappointment' then 'create' else 'update' end);
 end if;
 return 'true';
end;$$;
revoke all on function private.appointment_operation(text,jsonb) from public,authenticated;

alter function private.entity_json(text,jsonb) rename to entity_json_before_appointments;
create function private.entity_json(entity text,row_data jsonb) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 result:=private.entity_json_before_appointments(entity,row_data);
 if entity='vetappoointments' then
  result:=result||jsonb_build_object('isComplated',row_data->'isCompleted','statusName',case (row_data->>'status')::int when 1 then 'Bekliyor' when 2 then 'İptal Edildi' when 3 then 'Görüşüldü' when 4 then 'Gelmedi' else 'Bekliyor' end,
  'vaccineItems',case when nullif(row_data->>'vaccineId','') is not null then jsonb_build_array(jsonb_build_object('id',row_data->'id','productId',row_data->'vaccineId','date',row_data->'beginDate','isComplated',row_data->'isCompleted')) else '[]'::jsonb end);
 end if;
 return result;
end;$$;
revoke all on function private.entity_json(text,jsonb) from public,authenticated;

alter function private.read_operation(text,text,jsonb) rename to read_operation_before_appointments;
create function private.read_operation(action text,entity text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;tz text;target_date timestamptz;
begin
 if action in ('appointmentdatecheckcontrol','getappointmentdailylist') then
  perform private.require_access('appointments',false,private.branch());
  select timezone into tz from public.clinic_settings;
  if action='appointmentdatecheckcontrol' then
   target_date:=(payload->>'date')::timestamptz;
   if target_date is null then raise exception 'Tarih zorunlu';end if;
   return to_jsonb(not exists(select 1 from public.vetappoointments where not deleted and status<>2 and "beginDate"<=target_date and "endDate">target_date and private.allowed('appointments',false,branch_id)));
  end if;
  return (select coalesce(jsonb_agg(private.entity_json(entity,to_jsonb(a)) order by a."beginDate"),'[]') from public.vetappoointments a where not deleted and ("beginDate" at time zone tz)::date=(now() at time zone tz)::date and private.allowed('appointments',false,branch_id));
 end if;
 return private.read_operation_before_appointments(action,entity,payload);
end;$$;
revoke all on function private.read_operation(text,text,jsonb) from public,authenticated;

-- Schedules made from the vaccine screen must also have the vaccine calendar type.
create function private.calendar_appointment_type() returns trigger language plpgsql set search_path='' as $$
begin if new.calendar_id is not null then new."appointmentType":=1;end if;return new;end;$$;
create trigger calendar_appointment_type before insert or update on public.vetappoointments for each row execute function private.calendar_appointment_type();
revoke all on function private.calendar_appointment_type() from public,authenticated;
