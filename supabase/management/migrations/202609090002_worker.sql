alter table public.clinic_applications add column function_index integer not null default 0;
create function public.mark_clinic_creating(p_id uuid,p_lease uuid) returns boolean language plpgsql security definer set search_path='' as $$
begin
 update public.clinic_applications set state='creating',updated_at=now() where id=p_id and lease_id=p_lease and lease_until>now() and state='queued';
 return found;
end;$$;
revoke all on function public.mark_clinic_creating(uuid,uuid) from public;
grant execute on function public.mark_clinic_creating(uuid,uuid) to service_role;

-- Only the still-current lease may advance a job, including after an HTTP timeout.
create or replace function public.finish_clinic_job(p_id uuid,p_lease uuid,p_patch jsonb) returns boolean language plpgsql security definer set search_path='' as $$
begin
 update public.clinic_applications set
 attempts=case when coalesce(p_patch->>'state',state)<>state or coalesce(p_patch->>'migration_version',migration_version) is distinct from migration_version or coalesce((p_patch->>'function_index')::int,function_index)<>function_index then 0 else attempts end,
 state=coalesce(p_patch->>'state',state),project_ref=coalesce(p_patch->>'project_ref',project_ref),
 public_url=coalesce(p_patch->>'public_url',public_url),publishable_key=coalesce(p_patch->>'publishable_key',publishable_key),
 migration_version=coalesce(p_patch->>'migration_version',migration_version),function_index=coalesce((p_patch->>'function_index')::int,function_index),
 trial_ends_at=coalesce((p_patch->>'trial_ends_at')::timestamptz,trial_ends_at),safe_error=p_patch->>'safe_error',
 next_attempt_at=now()+interval '30 seconds',lease_until=null,lease_id=null,updated_at=now()
 where id=p_id and lease_id=p_lease and lease_until>now();
 return found;
end;$$;

create table private.activation_audit(id uuid primary key default gen_random_uuid(),application_id uuid not null references public.clinic_applications,reference text not null,at timestamptz not null default now());
create function public.record_paid_activation(p_id uuid,p_reference text) returns void language plpgsql security definer set search_path='' as $$
begin
 if length(trim(p_reference))<3 then raise exception 'Ödeme teyidi referansı gerekiyor';end if;
 update public.clinic_applications set paid=true,updated_at=now() where id=p_id and state='ready';
 if not found then raise exception 'Hazır klinik bulunamadı';end if;
 insert into private.activation_audit(application_id,reference) values(p_id,p_reference);
end;$$;
revoke all on function public.record_paid_activation(uuid,text) from public;
grant execute on function public.record_paid_activation(uuid,text) to service_role;
