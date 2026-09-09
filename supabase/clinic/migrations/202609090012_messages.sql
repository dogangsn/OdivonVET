alter table public.message_outbox add column receipt_after timestamptz;
create function public.claim_message_job() returns jsonb language plpgsql security definer set search_path='' as $$
declare job public.message_outbox;
begin
 -- A crashed sender is uncertain. Never send it automatically a second time.
 update public.message_outbox set state='unknown',safe_error='Gönderim sonucu belirsiz; sağlayıcı panelini kontrol edin.',updated_at=now() where state='sending' and updated_at<now()-interval '2 minutes';
 if not private.entitled() then return null;end if;
 select m.* into job from public.message_outbox m join public.profiles p on p.id=m.actor and p.active where m.state='queued' and (p.role='owner' or (p.branch_id=m.branch_id and exists(select 1 from private.role_permissions where role=p.role and scope='messages' and can_write))) order by m.created_at for update of m skip locked limit 1;
 if not found then return null;end if;
 update public.message_outbox set state='sending',updated_at=now() where id=job.id returning * into job;
 return to_jsonb(job);
end;$$;
create function public.claim_receipt_job() returns jsonb language plpgsql security definer set search_path='' as $$
declare job public.message_outbox;
begin
 select * into job from public.message_outbox where state='sent' and channel='sms' and provider_id is not null and receipt_after<=now() order by receipt_after for update skip locked limit 1;
 if not found then return null;end if;
 update public.message_outbox set receipt_after=now()+interval '15 minutes' where id=job.id;
 return to_jsonb(job);
end;$$;
revoke all on function public.claim_message_job(),public.claim_receipt_job() from public;
grant execute on function public.claim_message_job(),public.claim_receipt_job() to service_role;
