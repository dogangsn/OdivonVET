alter table public.message_outbox add column delivery_mode text not null default 'test' check(delivery_mode in ('test','live'));
-- Old queued requests did not record a mode; retain them without risking live delivery.
update public.message_outbox set state='failed',safe_error='Gönderim modu kayıtta bulunmuyor. İçeriği inceleyip yeni bir gönderim oluşturun.' where state='queued';
create table private.message_requests(actor uuid not null,request_key uuid not null,request jsonb not null,branch_id uuid,member_role text,primary key(actor,request_key));
create or replace function public.enqueue_message(p_channel text,p_recipients text[],p_subject text,p_body text,p_key uuid) returns integer language plpgsql security definer set search_path='' as $$
declare n integer;request jsonb;saved private.message_requests;mode text;recipients text[];
begin
 perform private.require_access('messages',true,private.branch());
 if p_key is null or p_body is null or length(trim(p_body))=0 or length(p_body)>10000 or p_recipients is null or coalesce(cardinality(p_recipients),0) not between 1 and 100 then raise exception 'Mesaj veya alıcı sayısı geçersiz';end if;
 if p_channel is null or p_channel not in ('sms','email') then raise exception 'Geçersiz kanal';end if;
 if exists(select 1 from unnest(p_recipients) r where r is null or (p_channel='sms' and r !~ '^\+?[0-9]{10,15}$') or (p_channel='email' and r !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')) then raise exception 'Geçersiz alıcı';end if;
 select array_agg(r order by r) into recipients from (select distinct unnest(p_recipients) r) t;
 request:=jsonb_build_object('channel',p_channel,'recipients',recipients,'subject',coalesce(p_subject,''),'body',p_body);
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_key::text,0));
 select * into saved from private.message_requests where actor=auth.uid() and request_key=p_key;
 if found then
  if saved.request<>request then raise exception 'İşlem anahtarı farklı içerik veya alıcılarla kullanılmış';end if;
  if saved.branch_id is distinct from private.branch() or saved.member_role is distinct from (select role from public.profiles where id=auth.uid()) then raise exception 'Üyelik veya şube değişmiş' using errcode='42501';end if;
  return 0;
 end if;
 select configuration->>'mode' into mode from private.provider_configuration where id=true;
 if mode is null or mode not in ('test','live') then raise exception 'Sağlayıcı modu yapılandırılmamış';end if;
 insert into private.message_requests values(auth.uid(),p_key,request,private.branch(),(select role from public.profiles where id=auth.uid()));
 insert into public.message_outbox(branch_id,actor,channel,recipient,subject,body,request_key,delivery_mode) select private.branch(),auth.uid(),p_channel,r,coalesce(p_subject,''),p_body,p_key,mode from unnest(recipients) r;
 get diagnostics n=row_count;return n;
end;$$;

create or replace function public.claim_message_job() returns jsonb language plpgsql security definer set search_path='' as $$
declare job public.message_outbox;
begin
 update public.message_outbox set state='unknown',safe_error='Gönderim sonucu belirsiz; sağlayıcı panelini kontrol edin.',updated_at=now() where state='sending' and updated_at<now()-interval '2 minutes';
 if not private.entitled() then return null;end if;
 select m.* into job from public.message_outbox m join public.profiles p on p.id=m.actor and p.active join public.branches b on b.id=m.branch_id and b.active where m.state='queued' and (p.role='owner' or (p.branch_id=m.branch_id and exists(select 1 from private.role_permissions where role=p.role and scope='messages' and can_write))) order by m.created_at for update of m skip locked limit 1;
 if not found then return null;end if;
 update public.message_outbox set state='sending',updated_at=now() where id=job.id returning * into job;
 return to_jsonb(job);
end;$$;

alter function public.set_provider_configuration(jsonb) rename to set_provider_configuration_before_validation;
alter function public.set_provider_configuration_before_validation(jsonb) set schema private;
revoke all on function private.set_provider_configuration_before_validation(jsonb) from public,authenticated;
create function public.set_provider_configuration(p_data jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_data->>'mode' is null or p_data->>'mode' not in ('test','live') then raise exception 'Geçersiz sağlayıcı modu';end if;
 perform private.set_provider_configuration_before_validation(p_data);
end;$$;
revoke all on function public.set_provider_configuration(jsonb) from public;grant execute on function public.set_provider_configuration(jsonb) to authenticated;
