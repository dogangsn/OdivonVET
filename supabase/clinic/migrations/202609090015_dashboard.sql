create function private.dashboard() returns jsonb language plpgsql security definer set search_path='' as $$
declare today date:=(now() at time zone 'Europe/Istanbul')::date;appointments jsonb;totals jsonb;
begin
 if not private.entitled() or not exists(select 1 from public.profiles where id=auth.uid() and active) then raise exception 'Aktif üyelik gerekiyor' using errcode='42501';end if;
 appointments:=case when private.allowed('appointments',false,private.branch()) then private.read_entity('vetappoointments','{}') else '[]'::jsonb end;
 totals:=jsonb_build_object(
 'dailyAddAppointmentCount',(select count(*) from public.vetappoointments where not deleted and ("beginDate" at time zone 'Europe/Istanbul')::date=today and private.allowed('appointments',false,branch_id)),
 'dailyAddAppointmentCompletedCount',(select count(*) from public.vetappoointments where not deleted and "isCompleted" and ("beginDate" at time zone 'Europe/Istanbul')::date=today and private.allowed('appointments',false,branch_id)),
 'dailyAddCustomerCount',(select count(*) from public.vetcustomers where not deleted and ("createDate" at time zone 'Europe/Istanbul')::date=today and private.allowed('customers',false,branch_id)),
 'dailyAddCustomerYestardayCount',(select count(*) from public.vetcustomers where not deleted and ("createDate" at time zone 'Europe/Istanbul')::date=today-1 and private.allowed('customers',false,branch_id)),
 'dailyTurnoverAmount',(select coalesce(sum(total),0) from public.vetsalebuyowner where not deleted and type=1 and (date at time zone 'Europe/Istanbul')::date=today and private.allowed('finance',false,branch_id)),
 'dailyTurnoverPreviousAmount',(select coalesce(sum(total),0) from public.vetsalebuyowner where not deleted and type=1 and (date at time zone 'Europe/Istanbul')::date=today-1 and private.allowed('finance',false,branch_id)),
 'totalStockAmount',(select coalesce(sum(quantity),0) from public.stock_ledger where private.allowed('inventory',false,branch_id)));
 return jsonb_build_object('totalCount',totals,'upcomingAppointment',(select coalesce(jsonb_agg(a order by a->>'beginDate'),'[]') from jsonb_array_elements(appointments) a where (a->>'beginDate')::timestamptz>=now() and not (a->>'isCompleted')::boolean),'pastAppointment',(select coalesce(jsonb_agg(a order by a->>'beginDate' desc),'[]') from jsonb_array_elements(appointments) a where (a->>'beginDate')::timestamptz<now() and not (a->>'isCompleted')::boolean));
end;$$;
revoke all on function private.dashboard() from public,authenticated;

alter function private.entity_json(text,jsonb) rename to entity_json_contract;
create function private.entity_json(entity text,row_data jsonb) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;related jsonb;
begin
 result:=private.entity_json_contract(entity,row_data);
 if entity='vetappoointments' then
  select jsonb_build_object('services',remark,'appointmentTypeName',remark,'colors',colors) into related from public.vetappointmenttypes where type=(row_data->>'appointmentType')::integer and not deleted and private.allowed('appointments',false,branch_id) limit 1;
  result:=result||coalesce(related,'{}')||jsonb_build_object('date',row_data->'beginDate','startDate',row_data->'beginDate','text',concat_ws(' / ',result->>'customerName',result->>'patientName'),'customerPatientName',concat_ws(' / ',result->>'customerName',result->>'patientName'),'statusName',case when (row_data->>'isCompleted')::boolean then 'Tamamlandı' when (row_data->>'status')::int=3 then 'İptal' else 'Bekliyor' end);
 elsif entity='vetagenda' then
  result:=result||jsonb_build_object('agendaTags',coalesce(row_data->'agendaTags','[]'),'order',coalesce(row_data->'order','0'));
 end if;
 return result;
end;$$;
revoke all on function private.entity_json(text,jsonb) from public,authenticated;

create function public.my_activities() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not private.entitled() or not exists(select 1 from public.profiles where id=auth.uid() and active) then raise exception 'Aktif üyelik gerekiyor' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(to_jsonb(t)),'[]') from (select id,at as date,operation||' / '||entity as description,record_id as "extraContent" from private.audit_log where actor=auth.uid() order by at desc limit 100) t);
end;$$;
revoke all on function public.my_activities() from public;grant execute on function public.my_activities() to authenticated;
