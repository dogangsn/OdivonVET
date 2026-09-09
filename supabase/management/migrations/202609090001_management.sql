create schema if not exists private;
revoke all on schema private from public;
create table private.platform_settings(id boolean primary key default true check(id),trial_slots integer not null default 3 check(trial_slots between 0 and 100), provisioning_enabled boolean not null default false);
insert into private.platform_settings values(true,3,false);
create table public.clinic_applications (
 id uuid primary key default gen_random_uuid(), applicant_id uuid not null unique references auth.users(id),
 email text not null unique, owner_name text not null, clinic_name text not null, code text not null unique check(code ~ '^[a-z0-9][a-z0-9-]{2,47}$'),
 state text not null check(state in ('waitlisted','queued','creating','waiting','schema','functions','owner','ready','attention')),
 slot_reserved boolean not null default false, project_ref text unique, public_url text, publishable_key text,
 migration_version text, trial_ends_at timestamptz, paid boolean not null default false,
 next_attempt_at timestamptz not null default now(), lease_until timestamptz, lease_id uuid,
 attempts integer not null default 0, safe_error text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.clinic_applications enable row level security;
create policy application_read on public.clinic_applications for select to authenticated using(applicant_id=auth.uid());
grant select(id,applicant_id,clinic_name,code,state,trial_ends_at,paid,safe_error,created_at) on public.clinic_applications to authenticated;
grant all on public.clinic_applications to service_role;
grant usage on schema private to service_role;
grant all on private.platform_settings to service_role;

create function public.register_clinic(p_name text,p_code text,p_owner text) returns uuid language plpgsql security definer set search_path='' as $$
declare user_record auth.users; settings private.platform_settings; count_slots integer; existing uuid; result uuid;
begin
 select * into user_record from auth.users where id=auth.uid();
 if not found or user_record.email_confirmed_at is null then raise exception 'Doğrulanmış e-posta gerekiyor' using errcode='42501';end if;
 p_code:=lower(trim(p_code));p_name:=trim(p_name);p_owner:=trim(p_owner);
 if p_code !~ '^[a-z0-9][a-z0-9-]{2,47}$' or length(p_name) not between 2 and 120 or length(p_owner) not between 2 and 120 then raise exception 'Klinik bilgileri geçersiz';end if;
 perform pg_advisory_xact_lock(9060901);
 select id into existing from public.clinic_applications where applicant_id=auth.uid();
 if existing is not null then return existing;end if;
 select * into settings from private.platform_settings where id=true;
 select count(*) into count_slots from public.clinic_applications where slot_reserved;
 insert into public.clinic_applications(applicant_id,email,owner_name,clinic_name,code,state,slot_reserved)
 values(auth.uid(),lower(user_record.email),p_owner,p_name,p_code,case when settings.provisioning_enabled and count_slots<settings.trial_slots then 'queued' else 'waitlisted' end,settings.provisioning_enabled and count_slots<settings.trial_slots) returning id into result;
 return result;
end;$$;
revoke all on function public.register_clinic(text,text,text) from public;
grant execute on function public.register_clinic(text,text,text) to authenticated;

create function public.claim_clinic_job() returns jsonb language plpgsql security definer set search_path='' as $$
declare job public.clinic_applications; settings private.platform_settings;
begin
 perform pg_advisory_xact_lock(9060901);
 select * into settings from private.platform_settings where id=true;
 if not settings.provisioning_enabled then return null;end if;
 if (select count(*) from public.clinic_applications where slot_reserved)<settings.trial_slots then
  update public.clinic_applications set state='queued',slot_reserved=true where id=(select id from public.clinic_applications where state='waitlisted' order by created_at limit 1);
 end if;
 select * into job from public.clinic_applications where state not in ('ready','waitlisted','attention') and next_attempt_at<=now() and (lease_until is null or lease_until<now()) order by created_at for update skip locked limit 1;
 if not found then return null;end if;
 update public.clinic_applications set lease_id=gen_random_uuid(),lease_until=now()+interval '5 minutes',attempts=attempts+1 where id=job.id returning * into job;
 return to_jsonb(job);
end;$$;
revoke all on function public.claim_clinic_job() from public;
grant execute on function public.claim_clinic_job() to service_role;

create function public.finish_clinic_job(p_id uuid,p_lease uuid,p_patch jsonb) returns boolean language plpgsql security definer set search_path='' as $$
begin
 update public.clinic_applications set
 state=coalesce(p_patch->>'state',state),project_ref=coalesce(p_patch->>'project_ref',project_ref),
 public_url=coalesce(p_patch->>'public_url',public_url),publishable_key=coalesce(p_patch->>'publishable_key',publishable_key),
 migration_version=coalesce(p_patch->>'migration_version',migration_version),
 trial_ends_at=coalesce((p_patch->>'trial_ends_at')::timestamptz,trial_ends_at),
 safe_error=p_patch->>'safe_error',next_attempt_at=now()+interval '30 seconds',lease_until=null,lease_id=null,updated_at=now()
 where id=p_id and lease_id=p_lease;
 return found;
end;$$;
revoke all on function public.finish_clinic_job(uuid,uuid,jsonb) from public;
grant execute on function public.finish_clinic_job(uuid,uuid,jsonb) to service_role;
