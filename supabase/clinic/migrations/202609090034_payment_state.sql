create function private.appointment_paid(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.vetsalebuyowner s where s."appointmentId"=p_id and not s.deleted and (select coalesce(sum(c.total),0) from public.vetpaymentcollection c where c."saleBuyId"=s.id and not c.deleted)>=s.total);
$$;
create function private.sync_appointment_payment() returns trigger language plpgsql security definer set search_path='' as $$
declare before_data jsonb:=to_jsonb(old);after_data jsonb:=to_jsonb(new);target uuid;
begin
 if tg_table_name='vetsalebuyowner' then
  for target in select distinct v::uuid from unnest(array[before_data->>'appointmentId',after_data->>'appointmentId']) v where v is not null loop
   update public.vetappoointments set "isPaymentReceived"=private.appointment_paid(target),"updateDate"=now() where id=target;
  end loop;
 else
  for target in select distinct "appointmentId" from public.vetsalebuyowner where id in ((before_data->>'saleBuyId')::uuid,(after_data->>'saleBuyId')::uuid) and "appointmentId" is not null loop
   update public.vetappoointments set "isPaymentReceived"=private.appointment_paid(target),"updateDate"=now() where id=target;
  end loop;
 end if;
 return coalesce(new,old);
end;$$;
create trigger appointment_sale_payment after insert or update or delete on public.vetsalebuyowner for each row execute function private.sync_appointment_payment();
create trigger appointment_collection_payment after insert or update or delete on public.vetpaymentcollection for each row execute function private.sync_appointment_payment();
revoke all on function private.appointment_paid(uuid),private.sync_appointment_payment() from public,authenticated;

alter function private.appointment_operation(text,jsonb) rename to appointment_operation_before_payment_state;
create function private.appointment_operation(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare b uuid;paid boolean;
begin
 if action='updatepaymentreceivedappointment' then
  select branch_id into b from public.vetappoointments where id=(payload->>'id')::uuid and not deleted;
  if not found then raise exception 'Randevu bulunamadı';end if;
  perform private.require_access('finance',true,b);
  paid:=private.appointment_paid((payload->>'id')::uuid);
  if coalesce((payload->>'isPaymentReceived')::boolean,true)<>paid then raise exception 'Ödeme durumu tahsilat kayıtlarından hesaplanır';end if;
 end if;
 return private.appointment_operation_before_payment_state(action,payload);
end;$$;
revoke all on function private.appointment_operation(text,jsonb) from public,authenticated;
