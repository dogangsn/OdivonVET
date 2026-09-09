create table public.clinic_files (
 id uuid primary key default gen_random_uuid(), branch_id uuid not null references public.branches,
 name text not null check(length(name) between 1 and 255), object_path text not null unique,
 size bigint not null check(size between 0 and 20971520), mime text not null,
 patient_id uuid, customer_id uuid, kind text not null default 'document' check(kind in ('document','lab')),
 state text not null default 'pending' check(state in ('pending','ready','deleted')),
 created_by uuid not null references public.profiles, created_at timestamptz not null default now(),
 foreign key(patient_id,branch_id) references public.vetpatients(id,branch_id),
 foreign key(customer_id,branch_id) references public.vetcustomers(id,branch_id)
);
alter table public.clinic_files enable row level security;
create policy file_metadata_read on public.clinic_files for select to authenticated
 using(state='ready' and private.allowed('files',false,branch_id));
grant select on public.clinic_files to authenticated;
grant all on public.clinic_files to service_role;

create function public.reserve_file(p_id uuid,p_name text,p_size bigint,p_mime text,p_patient uuid default null,p_customer uuid default null,p_kind text default 'document') returns jsonb language plpgsql security definer set search_path='' as $$
declare item public.clinic_files; b uuid:=private.branch();
begin
 perform private.require_access('files',true,b);
 if p_id is null or b is null then raise exception 'Dosya ve şube kimliği zorunlu';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select * into item from public.clinic_files where id=p_id;
 if found then
  if item.created_by<>auth.uid() or item.name<>p_name or item.size<>p_size or item.mime<>p_mime or item.patient_id is distinct from p_patient or item.customer_id is distinct from p_customer or item.kind<>p_kind or item.state='deleted' then raise exception 'Dosya anahtarı farklı bir istek için kullanılmış';end if;
  return to_jsonb(item);
 end if;
 insert into public.clinic_files(id,branch_id,name,object_path,size,mime,patient_id,customer_id,kind,created_by)
 values(p_id,b,p_name,b::text||'/'||p_id::text,p_size,p_mime,p_patient,p_customer,p_kind,auth.uid()) returning * into item;
 return to_jsonb(item);
end;$$;
revoke all on function public.reserve_file(uuid,text,bigint,text,uuid,uuid,text) from public;
grant execute on function public.reserve_file(uuid,text,bigint,text,uuid,uuid,text) to authenticated;

create function private.file_access(path text,writing boolean) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.clinic_files f where object_path=path and state<>'deleted' and
 ((not writing and private.is_owner()) or private.allowed('files',writing,f.branch_id))
 and (not writing or (f.created_by=auth.uid() and f.state='pending')));
$$;
revoke all on function private.file_access(text,boolean) from public;
grant execute on function private.file_access(text,boolean) to authenticated;

-- Storage is available on hosted/local Supabase. SQL-only tests provide a minimal schema.
insert into storage.buckets(id,name,public,file_size_limit) values('clinic-files','clinic-files',false,20971520)
 on conflict(id) do update set public=false,file_size_limit=20971520;
create policy clinic_files_read on storage.objects for select to authenticated
 using(bucket_id='clinic-files' and private.file_access(name,false));
create policy clinic_files_upload on storage.objects for insert to authenticated
 with check(bucket_id='clinic-files' and private.file_access(name,true));

create function public.finalize_file(p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare item public.clinic_files;
begin
 select * into item from public.clinic_files where id=p_id for update;
 if not found then raise exception 'Dosya bulunamadı';end if;
 perform private.require_access('files',true,item.branch_id);
 if item.created_by<>auth.uid() or item.state='deleted' then raise exception 'Dosya erişimi reddedildi' using errcode='42501';end if;
 if not exists(select 1 from storage.objects where bucket_id='clinic-files' and name=item.object_path) then raise exception 'Yükleme tamamlanmadı';end if;
 update public.clinic_files set state='ready' where id=p_id returning * into item;
 return to_jsonb(item);
end;$$;
create function public.delete_file(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare item public.clinic_files;
begin
 select * into item from public.clinic_files where id=p_id for update;
 if not found then raise exception 'Dosya bulunamadı';end if;
 perform private.require_access('files',true,item.branch_id);
 update public.clinic_files set state='deleted' where id=p_id;
 -- Retain the binary for backup/recovery; no client DELETE policy is granted.
end;$$;
create function public.export_files() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not private.is_owner() then raise exception 'Klinik sahibi yetkisi gerekiyor' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(to_jsonb(f)),'[]') from public.clinic_files f where state='ready');
end;$$;
revoke all on function public.finalize_file(uuid),public.delete_file(uuid),public.export_files() from public;
grant execute on function public.finalize_file(uuid),public.delete_file(uuid),public.export_files() to authenticated;

do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='vetappoointments') then
  alter publication supabase_realtime add table public.vetappoointments;
 end if;
end $$;
