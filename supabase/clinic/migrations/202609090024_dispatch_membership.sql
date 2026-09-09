-- Replays must be authorized against the membership that created their result.
alter table private.operation_receipts add column member_role text,add column member_branch uuid;
create function private.stamp_receipt_membership() returns trigger language plpgsql security definer set search_path='' as $$
begin select role,branch_id into new.member_role,new.member_branch from public.profiles where id=new.actor;return new;end;$$;
create trigger receipt_membership before insert on private.operation_receipts for each row execute function private.stamp_receipt_membership();
revoke all on function private.stamp_receipt_membership() from public,authenticated;
create or replace function private.allowed(scope text,writing boolean,branch uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.entitled() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.active and
 (p.role='owner' or (exists(select 1 from public.branches b where b.id=p.branch_id and b.active) and (branch is null or p.branch_id=branch) and exists(select 1 from private.role_permissions r where r.role=p.role and r.scope=$1 and (not $2 or r.can_write)))))
 and (not writing or branch is null or exists(select 1 from public.branches b where b.id=branch and b.active));
$$;
create or replace function public.vet_execute(p_operation text,p_payload jsonb default '{}',p_key uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare op private.operation_registry; action text; result jsonb; saved private.operation_receipts; record jsonb; child jsonb; writing boolean; sc text;
begin
 if auth.uid() is null then raise exception 'Oturum açın' using errcode='42501';end if;
 p_operation:=lower(p_operation);p_payload:=coalesce(p_payload,'{}');
 select * into op from private.operation_registry where path=p_operation;
 if not found then raise exception 'Tanımsız işlem: %',p_operation using errcode='0A000';end if;
 action:=split_part(p_operation,'/',3);
 writing:=op.mode<>'read' and action !~ '^(get|is|all)';
 if writing then
  if p_key is null then raise exception 'İşlem anahtarı zorunlu';end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_operation||p_key::text,0));
  select * into saved from private.operation_receipts where actor=auth.uid() and operation=p_operation and key=p_key;
  if found then
   if saved.member_role is distinct from (select role from public.profiles where id=auth.uid()) or saved.member_branch is distinct from private.branch() then raise exception 'İşlemden sonra üyelik veya şube değişmiş' using errcode='42501';end if;
   if saved.request<>p_payload then raise exception 'İşlem anahtarı farklı bir istek için kullanılmış';end if;
   -- A replay must not bypass a disabled membership or expired subscription.
   if not private.entitled() or not exists(select 1 from public.profiles where id=auth.uid() and active) then raise exception 'Aktif üyelik gerekiyor' using errcode='42501';end if;
   if op.entity is not null then select scope into sc from private.entity_registry where name=op.entity;perform private.require_access(sc,true,private.branch());end if;
   return saved.result;
  end if;
 end if;
 if op.mode='read' then result:=private.read_operation(action,op.entity,p_payload);
 elsif op.mode='crud' then result:=private.save_entity(op.entity,p_payload,op.verb);
 elsif action in ('createvaccine','updatevaccine','detelevaccine','createvaccineexamination','updatevaccineexamination','detelevaccineappointment') then result:=private.vaccine_operation(action,p_payload);
 elsif action in ('createsale','createsalebuy') then result:=private.create_sale(p_payload);
 elsif action='createsalecollection' then result:=private.collect_sale(p_payload);
 elsif action='deletesalebuy' then result:=private.cancel_sale(p_payload);
 elsif action in ('deletecollection','deletepaychart','updatesale','updatesalebuy','updatesalecollection','createbalancesalecollection','createcollection') then result:=private.commercial_operation(action,p_payload);
 elsif action in ('createcustomer','deletecustomer','createexamination','updateexamination','deleteexamination','createpatient','updatepatient','updatecustomerbyid','updatepatientsweight','createaccomodation','updateaccomodation','deleteaccomodation','updatecheckout') then result:=private.clinical_operation(action,p_payload);
 elsif action in ('createappointment','updateappointment','deleteappointment','updateappointmentstatus','updatecompletedappointment','updatepaymentreceivedappointment') then result:=private.appointment_operation(action,p_payload);
 elsif action in ('createpatient','updatepatient','deletepatient','updatecustomerbyid','updatecustomerarchive','updatepatientsweight','createappointment','updateappointment','deleteappointment','updateappointmentstatus','updatecompletedappointment','updatepaymentreceivedappointment','updateexaminationstatus','createroom','updateroom','deleteroom','createshortcuts','updateshortcuts','deleteshortcuts') then
  result:=private.save_entity(op.entity,p_payload,op.verb);
 elsif action in ('createstocktracking','updatestocktracking','deletestocktracking') then result:=private.stock_operation(action,p_payload);
 elsif action in ('getuserslist','getvetuserslist','getactiveuser','getallusers') then
  perform private.require_access('appointments',false,private.branch());
  if action='getactiveuser' then select jsonb_build_object('id',id,'firstName',name,'lastName','','name',name,'email',email,'role',role) into result from public.profiles where id=auth.uid() and active;else select coalesce(jsonb_agg(jsonb_build_object('id',id,'firstName',name,'lastName','','name',name,'email',email,'role',role)),'[]') into result from public.profiles where active and (private.is_owner() or branch_id=private.branch());end if;
 elsif action in ('getcompany','updatecompany','gettitledefination','createtitledefination','updatetitledefination','deletetiledefination') then result:=private.settings_operation(action,p_payload);
 elsif action='getbranchlist' then
  select coalesce(jsonb_agg(to_jsonb(b)),'[]') into result from public.branches b where private.allowed('definitions',false,b.id);
 elsif action in ('createbranch','updatebranch','deletebranch','updatecompany') then
  if not private.is_owner() or not private.entitled() then raise exception 'Yönetici yetkisi gerekiyor' using errcode='42501';end if;
  if action='createbranch' then insert into public.branches(name) values(p_payload->>'name') returning to_jsonb(branches.*) into result;
  elsif action='updatebranch' then update public.branches set name=p_payload->>'name' where id=(p_payload->>'id')::uuid returning to_jsonb(branches.*) into result;
  elsif action='deletebranch' then update public.branches set active=false where id=(p_payload->>'id')::uuid returning to_jsonb(branches.*) into result;
  else update public.clinic_settings set name=coalesce(p_payload->>'name',name) returning to_jsonb(clinic_settings.*) into result;end if;
 elsif action='getdashboard' then result:=private.dashboard();
 elsif action in ('sendmessage','multiautosendmessage') then result:=private.customer_message(action,p_payload);
 elsif action='getsmsparameterslist' then record:=public.provider_status();result:=case when record->>'mode'='test' or (record->>'smsConfigured')::boolean then '[{"active":true,"smsIntegrationType":1}]'::jsonb else '[]'::jsonb end;
 elsif action in ('getgraphiclist','weekvisitlist','bagelslicegraphlist','getclinicalstatisticslist') then result:=private.statistics(action,p_payload);
 elsif action='getuserrolesettinglist' then result:='[]';
 else result:=private.support_operation(action,op.entity,op.verb,p_payload);
 end if;
 result:=jsonb_build_object('data',result,'isSuccessful',true,'errors','[]'::jsonb,'statusCode',200);
 if writing then insert into private.operation_receipts(actor,operation,key,request,result) values(auth.uid(),p_operation,p_key,p_payload,result);end if;
 return result;
end;$$;
revoke all on function public.vet_execute(text,jsonb,uuid) from public;
grant execute on function public.vet_execute(text,jsonb,uuid) to authenticated;

