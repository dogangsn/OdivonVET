alter table public.vetagenda add column "agendaTags" jsonb not null default '[]',add column "order" integer not null default 0;
insert into private.operation_registry(path,entity,mode,verb) values
 ('vet/agenda/tags','vetagendatags','read','read'),('vet/agenda/createtag','vetagendatags','crud','create'),('vet/agenda/updatetag','vetagendatags','crud','update'),('vet/agenda/deletetag','vetagendatags','crud','delete'),('vet/agenda/updateorders','vetagenda','composite','update');

create function private.support_operation(action text,entity text,verb text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare record jsonb;child jsonb;recipient text;customer public.vetcustomers;result jsonb;
begin
 if action='updateorders' then
  for child in select value from jsonb_array_elements(payload->'items') loop perform private.save_entity('vetagenda',child,'update');end loop;
  return 'true';
 elsif action in ('createagenda','updateagenda','deleteagenda','createdemandproducts','updatedemandproducts','deletedemandproducts','updatedemand','updatedemandisbuying') then
  if action in ('createagenda','updateagenda') and jsonb_typeof(payload->'isActive')='boolean' then payload:=payload||jsonb_build_object('isActive',case when (payload->>'isActive')::boolean then 1 else 0 end);end if;
  return private.save_entity(entity,payload,verb);
 elsif action in ('createdemand','deletedemand') then
  record:=private.save_entity('vetdemands',payload,verb);
  if action='deletedemand' then
   update public.vetdemandproducts set deleted=true where "ownerId"=(record->>'id')::uuid;
   update public.vetdemandtrans set deleted=true where "ownerId"=(record->>'id')::uuid;
  else
   for child in select value from jsonb_array_elements(coalesce(payload->'demandProductList','[]')) loop
    if coalesce((child->>'quantity')::numeric,0)<=0 then raise exception 'Talep miktarı pozitif olmalı';end if;
    perform private.save_entity('vetdemandtrans',child||jsonb_build_object('ownerId',record->>'id','branch_id',record->>'branch_id','amount',(child->>'quantity')::numeric*coalesce((child->>'unitPrice')::numeric,0)),'create');
   end loop;
  end if;
  return record;
 elsif action='issaleproductcontrol' then
  perform private.require_access('finance',false,private.branch());
  return to_jsonb(exists(select 1 from public.vetsalebuytrans where "productId"=(payload->>'productId')::uuid and not deleted and private.allowed('finance',false,branch_id)));
 elsif action='getlogs' then
  if not private.is_owner() or not private.entitled() then raise exception 'Yönetici yetkisi gerekiyor' using errcode='42501';end if;
  return (select coalesce(jsonb_agg(to_jsonb(l)),'[]') from (select id,actor,operation,entity,record_id,at from private.audit_log order by id desc limit 500) l);
 end if;
 raise exception 'İşlem henüz Supabase eşleştirmesine alınmadı: %',action using errcode='0A000';
end;$$;
revoke all on function private.support_operation(text,text,text,jsonb) from public,authenticated;
