create table private.provider_configuration(id boolean primary key default true check(id),configuration jsonb not null default '{"mode":"test"}');
insert into private.provider_configuration values(true,'{"mode":"test"}');
create function public.provider_status() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare c jsonb;
begin
 perform private.require_access('messages',false,private.branch());
 select configuration into c from private.provider_configuration;
 return jsonb_build_object('mode',c->>'mode','smsConfigured',length(coalesce(c#>>'{sms,password}',''))>0,'emailConfigured',length(coalesce(c#>>'{email,key}',''))>0);
end;$$;
create function public.set_provider_configuration(p_data jsonb) returns void language plpgsql security definer set search_path='' as $$
declare c jsonb;fields jsonb;
begin
 if not private.is_owner() or not private.entitled() then raise exception 'Klinik sahibi yetkisi gerekiyor' using errcode='42501';end if;
 if p_data->>'mode' not in ('test','live') then raise exception 'Geçersiz sağlayıcı modu';end if;
 select configuration into c from private.provider_configuration where id=true for update;
 c:=c||jsonb_build_object('mode',p_data->>'mode');
 select coalesce(jsonb_object_agg(key,value),'{}') into fields from jsonb_each(coalesce(p_data->'sms','{}')) where key in ('user','password','sender') and length(value#>>'{}')>0;
 c:=c||jsonb_build_object('sms',coalesce(c->'sms','{}')||fields);
 select coalesce(jsonb_object_agg(key,value),'{}') into fields from jsonb_each(coalesce(p_data->'email','{}')) where key in ('key','from') and length(value#>>'{}')>0;
 c:=c||jsonb_build_object('email',coalesce(c->'email','{}')||fields);
 update private.provider_configuration set configuration=c where id=true;
end;$$;
create function public.get_provider_configuration() returns jsonb language sql stable security definer set search_path='' as $$select configuration from private.provider_configuration where id=true;$$;
revoke all on function public.provider_status(),public.set_provider_configuration(jsonb),public.get_provider_configuration() from public;
grant execute on function public.provider_status(),public.set_provider_configuration(jsonb) to authenticated;
grant execute on function public.get_provider_configuration() to service_role;

create function private.customer_message(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare customer public.vetcustomers;channel integer;channels jsonb;recipient text;
begin
 select * into customer from public.vetcustomers where id=(payload->>'customerId')::uuid and not deleted;
 if not found then raise exception 'Müşteri bulunamadı';end if;
 perform private.require_access('customers',false,customer.branch_id);
 perform private.require_access('messages',true,customer.branch_id);
 channels:=case when jsonb_typeof(payload->'type')='array' then payload->'type' else jsonb_build_array(coalesce(payload->'type','1')) end;
 if jsonb_array_length(channels)=0 then raise exception 'Gönderim kanalı seçin';end if;
 for channel in select value::int from jsonb_array_elements_text(channels) loop
  if channel not in (1,3) then raise exception 'Bu sürümde SMS ve e-posta destekleniyor';end if;
  recipient:=case when channel=1 then regexp_replace(customer."phoneNumber",'[^+0-9]','','g') else customer."eMail" end;
  perform public.enqueue_message(case when channel=1 then 'sms' else 'email' end,array[recipient],coalesce(payload->>'title','Odivon Vet'),payload->>'content',gen_random_uuid());
 end loop;
 return 'true';
end;$$;
revoke all on function private.customer_message(text,jsonb) from public,authenticated;
