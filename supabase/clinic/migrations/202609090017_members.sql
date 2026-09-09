create function public.session_permissions() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_agg(jsonb_build_object('scope',s,'read',private.allowed(s,false,private.branch()),'write',private.allowed(s,true,private.branch()))) from unnest(array['appointments','customers','clinical','finance','inventory','files','reports','messages','definitions','settings']) s;
$$;
revoke all on function public.session_permissions() from public;grant execute on function public.session_permissions() to authenticated;

create function public.update_member(p_id uuid,p_name text,p_role text,p_branch uuid,p_active boolean) returns void language plpgsql security definer set search_path='' as $$
declare old public.profiles;
begin
 if not private.is_owner() or not private.entitled() then raise exception 'Klinik sahibi yetkisi gerekiyor' using errcode='42501';end if;
 perform pg_advisory_xact_lock(9060904);
 select * into old from public.profiles where id=p_id for update;
 if not found then raise exception 'Üye bulunamadı';end if;
 if old.role='owner' and (p_role<>'owner' or not p_active) and (select count(*) from public.profiles where role='owner' and active)<=1 then raise exception 'Son klinik sahibi kapatılamaz';end if;
 if not exists(select 1 from public.branches where id=p_branch and active) then raise exception 'Şube bulunamadı';end if;
 update public.profiles set name=p_name,role=p_role,branch_id=p_branch,active=p_active where id=p_id;
end;$$;
revoke all on function public.update_member(uuid,text,text,uuid,boolean) from public;grant execute on function public.update_member(uuid,text,text,uuid,boolean) to authenticated;

create function public.add_invited_member(p_actor uuid,p_id uuid,p_name text,p_role text,p_branch uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.entitled() or not exists(select 1 from public.profiles where id=p_actor and role='owner' and active) then raise exception 'Klinik sahibi yetkisi gerekiyor' using errcode='42501';end if;
 if p_role not in ('vet','reception','accountant','reader') or not exists(select 1 from public.branches where id=p_branch and active) then raise exception 'Geçersiz rol veya şube';end if;
 insert into public.profiles(id,email,name,role,branch_id) select id,email,p_name,p_role,p_branch from auth.users where id=p_id on conflict(id) do nothing;
end;$$;
revoke all on function public.add_invited_member(uuid,uuid,text,text,uuid) from public;grant execute on function public.add_invited_member(uuid,uuid,text,text,uuid) to service_role;

create function public.lookup_invited_user(p_email text) returns uuid language sql stable security definer set search_path='' as $$select id from auth.users where lower(email)=lower(p_email) limit 1;$$;
revoke all on function public.lookup_invited_user(text) from public;grant execute on function public.lookup_invited_user(text) to service_role;
