create function public.prepare_clinic(p_owner uuid,p_email text,p_owner_name text,p_name text) returns jsonb language plpgsql security definer set search_path='' as $$
declare b uuid;settings public.clinic_settings;
begin
 perform pg_advisory_xact_lock(9060903);
 if not exists(select 1 from auth.users where id=p_owner and lower(email)=lower(p_email)) then raise exception 'Sahip hesabı bulunamadı';end if;
 select id into b from public.branches order by id limit 1;
 if b is null then insert into public.branches(name) values('Merkez') returning id into b;end if;
 insert into public.profiles(id,email,name,role,branch_id) values(p_owner,p_email,p_owner_name,'owner',b) on conflict(id) do nothing;
 insert into public.clinic_settings(id,name,status,trial_ends_at) values(true,p_name,'trial',now()+interval '14 days') on conflict(id) do update set status=case when clinic_settings.status='provisioning' then 'trial' else clinic_settings.status end,trial_ends_at=coalesce(clinic_settings.trial_ends_at,now()+interval '14 days') returning * into settings;
 if not exists(select 1 from public.vetparameters) then insert into public.vetparameters(branch_id) values(b);end if;
 if not exists(select 1 from public.vetanimalstype) then
  -- New product definitions, not migrated clinical data. Stable type codes are tested.
  insert into public.vetanimalstype(branch_id,type,name) values(b,1,'Kedi'),(b,2,'Köpek'),(b,3,'Kuş'),(b,4,'Diğer');
 end if;
 if not exists(select 1 from public.vetpaymentmethods) then insert into public.vetpaymentmethods(branch_id,name) values(b,'Nakit'),(b,'Kart'),(b,'Havale');end if;
 if not exists(select 1 from public.vetunits) then insert into public.vetunits(branch_id,"unitCode","unitName") values(b,'ADET','Adet'),(b,'ML','ml'),(b,'KG','kg');end if;
 if not exists(select 1 from public.vetstores) then insert into public.vetstores(branch_id,"depotCode","depotName",active) values(b,'MERKEZ','Ana Depo',true);end if;
 return to_jsonb(settings);
end;$$;
revoke all on function public.prepare_clinic(uuid,text,text,text) from public;
grant execute on function public.prepare_clinic(uuid,text,text,text) to service_role;

create function public.activate_paid(p_reference text) returns void language plpgsql security definer set search_path='' as $$
begin
 if length(trim(p_reference))<3 then raise exception 'Ödeme teyidi referansı zorunlu';end if;
 update public.clinic_settings set status='paid' where id=true;
 if not found then raise exception 'Klinik kurulmamış';end if;
 insert into private.audit_log(actor,operation,entity,record_id) values(null,'PAID_ACTIVATION','clinic_settings',p_reference);
end;$$;
revoke all on function public.activate_paid(text) from public;
grant execute on function public.activate_paid(text) to service_role;
