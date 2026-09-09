create function private.request_names(value jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb:='{}';item record;name text;normalized jsonb;
begin
 if jsonb_typeof(value)='array' then return coalesce((select jsonb_agg(private.request_names(v)) from jsonb_array_elements(value) v),'[]');end if;
 if jsonb_typeof(value)<>'object' then return value;end if;
 for item in select * from jsonb_each(value) loop
  name:=case when lower(item.key)='id' then 'id' else lower(left(item.key,1))||substr(item.key,2) end;
  normalized:=private.request_names(item.value);
  if result ? name and result->name<>normalized then raise exception 'Çelişen istek alanları';end if;
  result:=result||jsonb_build_object(name,normalized);
 end loop;
 return result;
end;$$;
alter function public.vet_execute(text,jsonb,uuid) rename to execute_before_request_names;
alter function public.execute_before_request_names(text,jsonb,uuid) set schema private;
revoke all on function private.execute_before_request_names(text,jsonb,uuid),private.request_names(jsonb) from public,authenticated;
create function public.vet_execute(p_operation text,p_payload jsonb default '{}',p_key uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
begin return private.execute_before_request_names(p_operation,private.request_names(coalesce(p_payload,'{}')),p_key);end;$$;
revoke all on function public.vet_execute(text,jsonb,uuid) from public;grant execute on function public.vet_execute(text,jsonb,uuid) to authenticated;
