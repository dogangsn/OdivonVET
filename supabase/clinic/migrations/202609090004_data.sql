-- Server-only provider configuration. Never expose legacy credential columns.
revoke select on public.vetsmsparameters from authenticated;
drop policy read_vetsmsparameters on public.vetsmsparameters;

create function private.normalize_payload(entity text,payload jsonb) returns jsonb language sql stable set search_path='' as $$
 select coalesce(jsonb_object_agg(c.column_name,j.value),'{}') from information_schema.columns c
 join jsonb_each(payload) j on lower(j.key)=lower(c.column_name)
 where c.table_schema='public' and c.table_name=entity
 and c.column_name not in ('id','recId','branch_id','createDate','updateDate','deleted','deletedDate','createUsers','updateUsers','deletedUsers');
$$;

create function private.save_entity(entity text,payload jsonb,verb text default 'create') returns jsonb language plpgsql security definer set search_path='' as $$
declare sc text; target uuid; branch uuid; old_record jsonb; result jsonb; values_json jsonb; columns_sql text; select_sql text; assignments text;
begin
 select r.scope into sc from private.entity_registry r where r.name=entity;
 if sc is null or entity='vetsmsparameters' then raise exception 'Unknown entity' using errcode='22023';end if;
 if verb not in ('create','update','delete') then raise exception 'Unknown mutation';end if;
 branch:=coalesce(nullif(payload->>'branch_id','')::uuid,private.branch());
 if verb<>'create' then
  target:=nullif(coalesce(payload->>'id',payload->>'Id'),'')::uuid;
  if target is null then raise exception 'Kayıt kimliği zorunlu';end if;
  execute format('select to_jsonb(t) from public.%I t where id=$1 and not deleted for update',entity) into old_record using target;
  if old_record is null then raise exception 'Kayıt bulunamadı' using errcode='P0002';end if;
  branch:=(old_record->>'branch_id')::uuid;
 end if;
 perform private.require_access(sc,true,branch);
 if verb='delete' then
  execute format('update public.%I set deleted=true,"updateDate"=now() where id=$1 returning to_jsonb(%I.*)',entity,entity) into result using target;
  return result;
 end if;
 values_json:=private.normalize_payload(entity,payload);
 select string_agg(format('%I',key),','),string_agg(format('r.%I',key),','),string_agg(format('%I=r.%I',key,key),',') into columns_sql,select_sql,assignments from jsonb_object_keys(values_json) key;
 if verb='create' then
  if columns_sql is null then raise exception 'Kayıt alanları boş';end if;
  execute format('insert into public.%I (%s,branch_id) select %s,$2 from jsonb_populate_record(null::public.%I,$1) r returning to_jsonb(%I.*)',entity,columns_sql,select_sql,entity,entity) into result using values_json,branch;
 else
  if assignments is null then raise exception 'Güncellenecek alan yok';end if;
  execute format('update public.%I t set %s,"updateDate"=now() from jsonb_populate_record(null::public.%I,$1) r where t.id=$2 returning to_jsonb(t.*)',entity,assignments,entity) into result using values_json,target;
 end if;
 return result;
end;
$$;

create function private.entity_json(entity text,row_data jsonb) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb:=row_data; related jsonb; name text;
begin
 if entity='vetcustomers' then
  select jsonb_build_object('petCount',count(*)) into related from public.vetpatients p where p."customerId"=(row_data->>'id')::uuid and not p.deleted and private.allowed('clinical',false,p.branch_id);
  result:=result||related||jsonb_build_object('recid','#'||(row_data->>'recId'),'email',row_data->>'eMail');
 elsif entity in ('vetanimalstype','vetanimalbreedsdef','vetanimalcolorsdef') then
  result:=result||jsonb_build_object('id',(row_data->>'recId')::bigint);
 end if;
 if row_data ? 'customerId' and nullif(row_data->>'customerId','') is not null then
  select concat_ws(' ',c."firstName",c."lastName") into name from public.vetcustomers c where c.id=(row_data->>'customerId')::uuid and not c.deleted and private.allowed('customers',false,c.branch_id);
  result:=result||jsonb_build_object('customerName',name,'customer',name);
 end if;
 if row_data ? 'patientId' and nullif(row_data->>'patientId','') is not null then
  select p.name into name from public.vetpatients p where p.id=(row_data->>'patientId')::uuid and not p.deleted and private.allowed('clinical',false,p.branch_id);
  result:=result||jsonb_build_object('patientName',name);
 end if;
 return result;
end;
$$;

create function private.read_entity(entity text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare sc text; result jsonb; predicates text:=''; field text; value text;
begin
 select r.scope into sc from private.entity_registry r where r.name=entity;
 if sc is null or entity='vetsmsparameters' then raise exception 'Unknown entity';end if;
 perform private.require_access(sc,false,private.branch());
 -- The request cannot specify SQL or arbitrary columns. Only exact named filters are accepted.
 for field in select column_name from information_schema.columns where table_schema='public' and table_name=entity and column_name in ('id','customerId','patientId','productId','ownerId','isArchive','type','animalType','branch_id','recId','vaccineId','patientsId','sourceId','saleBuyId','appointmentType','isCompleted','isDone','productTypeId') loop
  select j.value#>>'{}' into value from jsonb_each(payload) j where lower(j.key)=lower(field) limit 1;
  if value is not null and value<>'' and value<>'00000000-0000-0000-0000-000000000000' then
   predicates:=predicates||format(' and t.%I::text=%L',field,value);
  end if;
 end loop;
 execute format('select coalesce(jsonb_agg(private.entity_json(%L,to_jsonb(t)) order by t."recId"),''[]''::jsonb) from public.%I t where not t.deleted and private.allowed(%L,false,t.branch_id)%s',entity,entity,sc,predicates) into result;
 return result;
end;
$$;

-- Minimal relational integrity: related clinical records must belong to the same branch.
create unique index customers_id_branch on public.vetcustomers(id,branch_id);
create unique index patients_id_branch on public.vetpatients(id,branch_id);
alter table public.vetpatients add constraint patients_customer foreign key("customerId",branch_id) references public.vetcustomers(id,branch_id);
alter table public.vetexamination add constraint examination_patient foreign key("patientId",branch_id) references public.vetpatients(id,branch_id);
alter table public.vetweightcontrol add constraint weight_patient foreign key("patientId",branch_id) references public.vetpatients(id,branch_id);
create unique index customers_active_phone on public.vetcustomers(btrim("phoneNumber")) where not deleted and btrim("phoneNumber")<>'';
alter table public.vetcustomers add constraint customer_name check(length(btrim("firstName"))>0);
alter table public.vetpatients add constraint patient_name check(length(btrim(name))>0);

create function private.clinical_operation(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare record jsonb; child jsonb; patient_ids text[]:='{}'; entity text; verb text;
begin
 if action='createcustomer' then
  record:=private.save_entity('vetcustomers',coalesce(payload->'createCustomers',payload),'create');
  for child in select value from jsonb_array_elements(coalesce(payload#>'{createCustomers,patientDetails}',payload->'patientDetails','[]')) loop
   if coalesce((child->>'animalType')::int,0)=0 then raise exception 'Hayvan türü zorunlu';end if;
   child:=private.save_entity('vetpatients',child||jsonb_build_object('customerId',record->>'id','branch_id',record->>'branch_id'),'create');
   patient_ids:=array_append(patient_ids,child->>'id');
  end loop;
  if coalesce((payload->>'isCreateVaccine')::boolean,false) then return to_jsonb(array_to_string(patient_ids,','));end if;
  return to_jsonb(record->>'id');
 elsif action='deletecustomer' then
  perform private.require_access('customers',true,private.branch());
  if exists(select 1 from public.vetsalebuyowner where "customerId"=(payload->>'id')::uuid and not deleted) then raise exception 'Finansal kaydı bulunan müşteri silinemez; arşivleyin.';end if;
  record:=private.save_entity('vetcustomers',payload,'delete');
  update public.vetpatients set deleted=true where "customerId"=(record->>'id')::uuid;
  return 'true'::jsonb;
 elsif action in ('createexamination','updateexamination') then
  if coalesce(payload->>'status','') in ('Aktif','Tamamlandı','Bekliyor','İptal') then
   payload:=payload||jsonb_build_object('status',case payload->>'status' when 'Aktif' then 0 when 'Tamamlandı' then 1 when 'Bekliyor' then 2 else 3 end);
  end if;
  if jsonb_array_length(coalesce(payload->'trans','[]'))>0 or coalesce((payload->>'price')::numeric,0)>0 then
   raise exception 'Ücretli muayene, satış işlemiyle birlikte kaydedilmelidir.';
  end if;
  record:=private.save_entity('vetexamination',payload,case when action='createexamination' then 'create' else 'update' end);
  if coalesce((payload->>'weight')::numeric,0)>0 then perform private.save_entity('vetweightcontrol',jsonb_build_object('patientId',record->>'patientId','weight',payload->'weight','date',now(),'branch_id',record->>'branch_id'),'create');end if;
  return 'true'::jsonb;
 end if;
 raise exception 'Klinik işlemi henüz taşınmadı: %',action using errcode='0A000';
end;
$$;
revoke all on function private.normalize_payload(text,jsonb),private.save_entity(text,jsonb,text),private.entity_json(text,jsonb),private.read_entity(text,jsonb),private.clinical_operation(text,jsonb) from public,authenticated;
