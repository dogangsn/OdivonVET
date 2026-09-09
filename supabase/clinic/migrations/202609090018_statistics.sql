create function private.statistics(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb:='[]';kind integer;y integer:=coalesce((payload->>'year')::int,extract(year from now())::int);months jsonb;totals jsonb;
begin
 perform private.require_access('reports',false,private.branch());
 if action='getgraphiclist' then
  perform private.require_access('finance',false,private.branch());
  for kind in 1..2 loop
   select jsonb_object_agg(n.month_name,coalesce(t.amount,0)) into months from unnest(array['ocak','subat','mart','nisan','mayis','haziran','temmuz','agustos','eylul','ekim','kasim','aralik']) with ordinality n(month_name,num)
   left join (select extract(month from date at time zone 'Europe/Istanbul') m,sum(total) amount from public.vetsalebuyowner where not deleted and type=kind and extract(year from date at time zone 'Europe/Istanbul')=y and private.allowed('finance',false,branch_id) group by 1)t on t.m=n.num;
   select jsonb_build_object('sumSatis',case when kind=1 then coalesce(sum(total),0) else 0 end,'sumAlis',case when kind=2 then coalesce(sum(total),0) else 0 end,'netPriceSum',coalesce(sum("netPrice"),0),'kdvSum',coalesce(sum("kDV"),0)) into totals from public.vetsalebuyowner where not deleted and type=kind and extract(year from date at time zone 'Europe/Istanbul')=y and private.allowed('finance',false,branch_id);
   result:=result||jsonb_build_array(totals||jsonb_build_object('name',case when kind=1 then 'Satış Tutarı' else 'Alış Tutarı' end,'types',case when kind=1 then 'line' else 'column' end,'realType',kind,'realDateYear',y,'months',jsonb_build_array(months)));
  end loop;
 elsif action='weekvisitlist' then
  perform private.require_access('appointments',false,private.branch());
  select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from (
   select (array['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'])[extract(isodow from "beginDate" at time zone 'Europe/Istanbul')::int] as "dayName",count(*) as "allVisitcount",count(*) filter(where "isCompleted") as "visitCountSum",count(*) filter(where not "isCompleted") as "unVisitCountSum",case when "beginDate">=date_trunc('week',now()) then 1 else 2 end as "thisAndLastType"
   from public.vetappoointments where not deleted and "beginDate">=date_trunc('week',now())-interval '1 week' and "beginDate"<date_trunc('week',now())+interval '1 week' and private.allowed('appointments',false,branch_id) group by 1,5)t;
 elsif action='bagelslicegraphlist' then
  select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from (
   select "animalType"::text id,null::uuid as "guidId",count(*) counts,1 types from public.vetpatients where not deleted and private.allowed('clinical',false,branch_id) group by 1
   union all select null,"supplierId",count(*),2 from public.vetsalebuyowner where not deleted and "supplierId" is not null and private.allowed('finance',false,branch_id) group by 2
   union all select null,"productId",sum(quantity)::bigint,3 from public.vetsalebuytrans where not deleted and "productId" is not null and private.allowed('finance',false,branch_id) group by 2)t;
 elsif action='getclinicalstatisticslist' then
  perform private.require_access('finance',false,private.branch());
  select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from (
   select "paymetntId" as "paymentType",sum(total) total,2 as "requestType",extract(year from date)::int as "year",extract(month from date)::int as "month" from public.vetpaymentcollection where not deleted and private.allowed('finance',false,branch_id) group by 1,4,5
   union all select coalesce("paymentType",0),sum(total),case when type=2 then 3 else 4 end,extract(year from date)::int,extract(month from date)::int from public.vetsalebuyowner where not deleted and private.allowed('finance',false,branch_id) group by 1,3,4,5)t;
 end if;
 return result;
end;$$;
revoke all on function private.statistics(text,jsonb) from public,authenticated;
