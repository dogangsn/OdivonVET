-- Empty optional IDs/date controls from the preserved Angular forms become SQL NULL.
alter function private.normalize_payload(text,jsonb) rename to normalize_payload_dto;
create function private.normalize_payload(entity text,payload jsonb) returns jsonb language sql stable set search_path='' as $$
 select coalesce(jsonb_object_agg(j.key,case when c.data_type in ('uuid','timestamp with time zone') and (j.value='""'::jsonb or (c.data_type='uuid' and j.value='"00000000-0000-0000-0000-000000000000"'::jsonb)) then 'null'::jsonb else j.value end),'{}')
 from jsonb_each(private.normalize_payload_dto(entity,payload)) j join information_schema.columns c on c.table_schema='public' and c.table_name=entity and c.column_name=j.key;
$$;
revoke all on function private.normalize_payload(text,jsonb) from public,authenticated;

alter function private.entity_json(text,jsonb) rename to entity_json_display;
create function private.entity_json(entity text,row_data jsonb) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb:=private.entity_json_display(entity,row_data);related jsonb;
begin
 if entity='vetsmstemplate' then result:=result||jsonb_build_object('templateName',row_data->'name','templateContent',row_data->'content','smsType',row_data->'type');
 elsif entity='vetpatients' then result:=result||jsonb_build_object('customerFirsLastName',result->>'customerName');
 elsif entity='vetcustomers' then
  select jsonb_build_object('balance',coalesce((select sum(total) from public.vetsalebuyowner where "customerId"=(row_data->>'id')::uuid and type=1 and not deleted and private.allowed('finance',false,branch_id)),0)-coalesce((select sum(total) from public.vetpaymentcollection where "customerId"=(row_data->>'id')::uuid and not deleted and private.allowed('finance',false,branch_id)),0)) into related;
  result:=result||related;
 end if;
 return result;
end;$$;
revoke all on function private.entity_json(text,jsonb) from public,authenticated;
