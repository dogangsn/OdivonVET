update private.operation_registry set mode='read' where path='vet/reports/getappointmentdashboard';
alter function private.read_operation(text,text,jsonb) rename to read_operation_before_report;
create function private.read_operation(action text,entity text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;tz text;today date;
begin
 if action='getappointmentdashboard' then
  perform private.require_access('reports',false,private.branch());perform private.require_access('appointments',false,private.branch());
  select timezone into tz from public.clinic_settings;today:=(now() at time zone tz)::date;
  select jsonb_build_object('totalAppointmentWeek',count(*) filter(where ("beginDate" at time zone tz)::date>=date_trunc('week',today)::date and ("beginDate" at time zone tz)::date<date_trunc('week',today)::date+7),
   'totalAppointmentMonth',count(*) filter(where date_trunc('month',"beginDate" at time zone tz)=date_trunc('month',today)),
   'totalAppointmentYear',count(*) filter(where extract(year from "beginDate" at time zone tz)=extract(year from today)),
   'totalCompletedAppointments',count(*) filter(where "isCompleted")) into result
   from public.vetappoointments where not deleted and private.allowed('appointments',false,branch_id);
  return result||(select jsonb_build_object('monthlyAppointmentCounts',jsonb_agg(total order by month),'monthlyAppointmentCompletedCounts',jsonb_agg(completed order by month)) from
   (select month,count(a.id) total,count(a.id) filter(where a."isCompleted") completed from generate_series(1,12) month left join public.vetappoointments a on not a.deleted and private.allowed('appointments',false,a.branch_id) and extract(year from a."beginDate" at time zone tz)=extract(year from today) and extract(month from a."beginDate" at time zone tz)=month group by month) t);
 end if;
 return private.read_operation_before_report(action,entity,payload);
end;$$;
revoke all on function private.read_operation(text,text,jsonb) from public,authenticated;

-- Shortcut forms wrap their values; retain that request shape at the data boundary.
alter function private.normalize_payload(text,jsonb) rename to normalize_before_shortcuts;
create function private.normalize_payload(entity text,payload jsonb) returns jsonb language plpgsql stable set search_path='' as $$
begin
 if entity='vetshortcuts' then
  payload:=coalesce(payload->'shortcut',payload);
  if payload ? 'link' and (coalesce(payload->>'link','') !~ '^/[^/]' or payload->>'link' ~ '[[:cntrl:]\\]') then raise exception 'Kısayol uygulama içindeki bir sayfaya yönelmeli';end if;
  payload:=payload||jsonb_build_object('useRouter',true);
 end if;
 return private.normalize_before_shortcuts(entity,payload);
end;$$;
revoke all on function private.normalize_payload(text,jsonb) from public,authenticated;
