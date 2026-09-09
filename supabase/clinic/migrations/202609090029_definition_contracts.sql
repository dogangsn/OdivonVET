-- Integer lookup identifiers are retained for the existing selectors; writes still
-- resolve to an authorized UUID record before reaching the common data function.
alter function private.save_entity(text,jsonb,text) rename to save_entity_before_legacy_id;
create function private.save_entity(entity text,payload jsonb,verb text default 'create') returns jsonb language plpgsql security definer set search_path='' as $$
declare target uuid;legacy_id text;
begin
 if verb<>'create' and entity in ('vetanimalstype','vetanimalbreedsdef','vetanimalcolorsdef','vetpaymentmethods') then
  legacy_id:=coalesce(payload->>'recId',payload->>'recid',payload->>'id');
  if legacy_id ~ '^[0-9]+$' then
   execute format('select id from public.%I where "recId"=$1 and not deleted',entity) into target using legacy_id::bigint;
   if target is null then raise exception 'Tanım bulunamadı';end if;
   payload:=payload||jsonb_build_object('id',target);
  end if;
 end if;
 return private.save_entity_before_legacy_id(entity,payload,verb);
end;$$;
revoke all on function private.save_entity(text,jsonb,text) from public,authenticated;

alter function private.read_operation(text,text,jsonb) rename to read_operation_before_definitions;
create function private.read_operation(action text,entity text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if action='parameterslist' then return private.read_entity(entity,jsonb_build_object('branch_id',private.branch()));end if;
 return private.read_operation_before_definitions(action,entity,payload);
end;$$;
revoke all on function private.read_operation(text,text,jsonb) from public,authenticated;

create function private.seed_branch_defaults(b uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.vetparameters where branch_id=b and not deleted) then
  insert into public.vetparameters(branch_id,"appointmentBeginDate","appointmentEndDate","appointmentInterval","appointmentSeansDuration",days) values(b,'08:00','20:00',30,30,'1,2,3,4,5,');
 end if;
 if not exists(select 1 from public.vetappointmenttypes where branch_id=b and not deleted) then
  insert into public.vetappointmenttypes(branch_id,type,remark,colors) values(b,0,'İlk Muayene','#2563eb'),(b,1,'Aşı Randevusu','#16a34a'),(b,2,'Genel Muayene','#7c3aed'),(b,3,'Kontrol Muayene','#0891b2'),(b,4,'Operasyon','#dc2626'),(b,5,'Tıraş','#d97706'),(b,6,'Tedavi','#db2777');
 end if;
 if not exists(select 1 from public.vetanimalstype where branch_id=b and not deleted) then insert into public.vetanimalstype(branch_id,type,name) values(b,1,'Kedi'),(b,2,'Köpek'),(b,3,'Kuş'),(b,4,'Diğer');end if;
end;$$;
create function private.seed_new_branch() returns trigger language plpgsql security definer set search_path='' as $$
begin perform private.seed_branch_defaults(new.id);return new;end;$$;
create trigger new_branch_defaults after insert on public.branches for each row execute function private.seed_new_branch();
do $$declare b record;begin for b in select id from public.branches loop perform private.seed_branch_defaults(b.id);end loop;end;$$;
revoke all on function private.seed_branch_defaults(uuid),private.seed_new_branch() from public,authenticated;

alter function private.entity_json(text,jsonb) rename to entity_json_before_type;
create function private.entity_json(entity text,row_data jsonb) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if entity='vetanimalstype' then return private.entity_json_before_type(entity,row_data)||jsonb_build_object('id',row_data->'type');end if;
 return private.entity_json_before_type(entity,row_data);
end;$$;
revoke all on function private.entity_json(text,jsonb) from public,authenticated;
