alter table public.vetsalebuytrans alter column quantity type numeric;
alter function private.entity_json(text,jsonb) rename to entity_json_before_finance;
create function private.entity_json(entity text,row_data jsonb) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;related jsonb;content text;payment text;collected numeric;
begin
 result:=private.entity_json_before_finance(entity,row_data);
 if entity='vetsalebuytrans' then
  select jsonb_build_object('productName',p.name,'unit',p."unitId",'unitName',u."unitName") into related from public.vetproducts p left join public.vetunits u on u.id=p."unitId" and u.branch_id=p.branch_id where p.id=(row_data->>'productId')::uuid and p.branch_id=(row_data->>'branch_id')::uuid;
  result:=result||coalesce(related,'{}')||jsonb_build_object('product',row_data->'productId','unitPrice',row_data->'price','vat',row_data->'taxisId','netVat',row_data->'vatAmount');
 elsif entity='vetsalebuyowner' then
  select string_agg(coalesce(p.name,'Hizmet'),', ' order by t."recId") into content from public.vetsalebuytrans t left join public.vetproducts p on p.id=t."productId" and p.branch_id=t.branch_id where t."ownerId"=(row_data->>'id')::uuid and not t.deleted and private.allowed('finance',false,t.branch_id);
  select name into payment from public.vetpaymentmethods where "recId"=(row_data->>'paymentType')::int and branch_id=(row_data->>'branch_id')::uuid;
  select jsonb_build_object('supplierName',"supplierName") into related from public.vetsuppliers where id=(row_data->>'supplierId')::uuid and branch_id=(row_data->>'branch_id')::uuid;
  collected:=coalesce((result->>'paid')::numeric,0);
  result:=result||coalesce(related,'{}')||jsonb_build_object('saleOwnerId',row_data->'id','amount',row_data->'total','collection',collected,'rameiningBalance',(row_data->>'total')::numeric-collected,
   'salesContent',case when (row_data->>'isExaminations')::boolean then 'MUAYENE SATIŞ' when (row_data->>'isAccomodation')::boolean then 'KONAKLAMA BEDELİ' else content end,
   'productName',content,'operationNumber',row_data->'recId','note',row_data->'remark','paymentName',coalesce(payment,'Belirtilmemiş'));
 elsif entity='vetpaymentcollection' then
  select name into payment from public.vetpaymentmethods where "recId"=(row_data->>'paymetntId')::int and branch_id=(row_data->>'branch_id')::uuid;
  result:=result||jsonb_build_object('paymentName',coalesce(payment,'Belirtilmemiş'),'paymentType',coalesce(payment,'Belirtilmemiş'),'operation',coalesce(nullif(row_data->>'remark',''),'Tahsilat'),'amount',row_data->'total','note',row_data->'remark','operationNumber',row_data->'recId');
 end if;
 return result;
end;$$;
revoke all on function private.entity_json(text,jsonb) from public,authenticated;

alter function private.read_operation(text,text,jsonb) rename to read_operation_before_finance;
create function private.read_operation(action text,entity text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;tz text;starts date;ends date;
begin
 if action='gettransactionmovementlist' then return private.read_entity('vetsalebuyowner',payload);end if;
 if action='getlogs' then return private.support_operation(action,entity,'read',payload);end if;
 if action='salebuylistfilter' then
  select timezone into tz from public.clinic_settings;
  starts:=nullif(payload->>'beginDate','')::timestamptz at time zone tz;ends:=nullif(payload->>'endDate','')::timestamptz at time zone tz;
  if starts is null or ends is null or starts>ends then raise exception 'Geçerli tarih aralığı seçin';end if;
  result:=private.read_entity(entity,payload);
  return (select coalesce(jsonb_agg(r),'[]') from jsonb_array_elements(result) r where ((r->>'date')::timestamptz at time zone tz)::date between starts and ends and (coalesce((payload->>'paymentType')::int,0)=0 or (r->>'paymentType')::int=(payload->>'paymentType')::int));
 end if;
 return private.read_operation_before_finance(action,entity,payload);
end;$$;
revoke all on function private.read_operation(text,text,jsonb) from public,authenticated;

-- A submitted cross-branch foreign identifier must not be stored on a sale.
alter function private.create_sale(jsonb) rename to create_sale_before_relations;
create function private.create_sale(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare branch uuid:=coalesce(nullif(payload->>'branch_id','')::uuid,private.branch());payment integer:=coalesce((payload->>'paymentType')::int,0);result jsonb;
begin
 perform private.require_access('finance',true,branch);
 if nullif(nullif(payload->>'supplierId',''),'00000000-0000-0000-0000-000000000000') is not null and not exists(select 1 from public.vetsuppliers where id=(payload->>'supplierId')::uuid and not deleted and branch_id=branch) then raise exception 'Tedarikçi ve şube eşleşmiyor';end if;
 if payment<>0 and not exists(select 1 from public.vetpaymentmethods where "recId"=payment and not deleted and branch_id=branch) then raise exception 'Ödeme yöntemi bulunamadı';end if;
 result:=private.create_sale_before_relations(payload);
 update public.vetsalebuyowner set "paymentType"=payment where id=(result->>'id')::uuid;
 return result;
end;$$;
revoke all on function private.create_sale(jsonb) from public,authenticated;
