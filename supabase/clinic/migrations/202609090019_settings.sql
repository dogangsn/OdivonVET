alter table public.clinic_settings add column details jsonb not null default '{}';
alter table public.branches add column district text not null default '',add column address text not null default '',add column phone text not null default '';
create table public.staff_titles(id uuid primary key default gen_random_uuid(),name text not null,remark text not null default '');
alter table public.staff_titles enable row level security;
create policy titles_read on public.staff_titles for select to authenticated using(private.allowed('settings',false,private.branch()));
grant select on public.staff_titles to authenticated;grant all on public.staff_titles to service_role;

create function private.settings_operation(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;new_details jsonb;
begin
 perform private.require_access('settings',action!~'^get',private.branch());
 if action='getcompany' then
  select c.details||jsonb_build_object('id','clinic','companyName',c.name) into result from public.clinic_settings c;
 elsif action='updatecompany' then
  -- Explicit allowlist excludes subscription status, trial expiry and provider secrets.
  select coalesce(jsonb_object_agg(key,value),'{}') into new_details from jsonb_each(payload) where key in ('companyCode','eMail','phone','adress','companyTitle','tradeName','taxNumber','taxOffice','defaultInvoiceType','companyImage','buildingName','buildingNumber','city','invoiceAmountNotes','invoiceNoAutoCreate','invoiceSendEMail');
  update public.clinic_settings set name=coalesce(payload->>'companyName',name),details=clinic_settings.details||new_details returning to_jsonb(clinic_settings.*) into result;
 elsif action in ('gettitledefination','createtitledefination','updatetitledefination','deletetiledefination') then
  if action='gettitledefination' then select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from public.staff_titles t;
  elsif action='createtitledefination' then insert into public.staff_titles(name,remark) values(coalesce(payload->>'name',payload->>'title'),coalesce(payload->>'remark','')) returning to_jsonb(staff_titles.*) into result;
  elsif action='updatetitledefination' then update public.staff_titles set name=coalesce(payload->>'name',payload->>'title',name),remark=coalesce(payload->>'remark',remark) where id=(payload->>'id')::uuid returning to_jsonb(staff_titles.*) into result;
  else delete from public.staff_titles where id=(payload->>'id')::uuid returning to_jsonb(staff_titles.*) into result;end if;
 end if;
 return result;
end;$$;
revoke all on function private.settings_operation(text,jsonb) from public,authenticated;

create or replace function public.export_clinic() returns jsonb language plpgsql security definer set search_path='' as $$
declare e record;data jsonb;result jsonb:='{}';table_name text;
begin
 if not private.is_owner() then raise exception 'Klinik sahibi yetkisi gerekiyor' using errcode='42501';end if;
 for e in select name from private.entity_registry where name<>'vetsmsparameters' loop
  execute format('select coalesce(jsonb_agg(to_jsonb(t)),''[]'') from public.%I t',e.name) into data;result:=result||jsonb_build_object(e.name,data);
 end loop;
 foreach table_name in array array['branches','profiles','clinic_settings','stock_ledger','cheques','message_outbox','clinic_files','staff_titles'] loop
  execute format('select coalesce(jsonb_agg(to_jsonb(t)),''[]'') from public.%I t',table_name) into data;result:=result||jsonb_build_object(table_name,data);
 end loop;
 return jsonb_build_object('formatVersion',1,'exportedAt',now(),'tables',result);
end;$$;
