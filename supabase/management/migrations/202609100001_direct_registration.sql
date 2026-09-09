-- Server-generated clinic identifiers; existing three-argument API remains compatible.
create function public.register_clinic(p_name text,p_owner text) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid; generated_code text;
begin
 if auth.uid() is null then raise exception 'Oturum açın' using errcode='42501';end if;
 perform pg_advisory_xact_lock(9060901);
 select id into result from public.clinic_applications where applicant_id=auth.uid();
 if result is not null then return result;end if;
 loop
  generated_code := 'vet-' || replace(gen_random_uuid()::text,'-','');
  exit when not exists(select 1 from public.clinic_applications where code=generated_code);
 end loop;
 -- Auth auto-confirms accounts when Confirm email is disabled in the management project.
 return public.register_clinic(p_name,generated_code,p_owner);
end;$$;
revoke all on function public.register_clinic(text,text) from public;
grant execute on function public.register_clinic(text,text) to authenticated;
