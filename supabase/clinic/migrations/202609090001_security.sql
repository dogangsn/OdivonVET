create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create table public.clinic_settings (
 id boolean primary key default true check(id), name text not null,
 status text not null default 'provisioning' check(status in ('provisioning','trial','paid','suspended')),
 trial_ends_at timestamptz, timezone text not null default 'Europe/Istanbul', currency text not null default 'TRY'
);
create table public.branches (id uuid primary key default gen_random_uuid(), name text not null, active boolean not null default true);
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade, email text not null,
 name text not null, role text not null check(role in ('owner','vet','reception','accountant','reader')),
 branch_id uuid references public.branches(id), active boolean not null default true
);
create table private.role_permissions(role text not null, scope text not null, can_write boolean not null, primary key(role,scope));
insert into private.role_permissions values
 ('vet','clinical',true),('vet','customers',true),('vet','appointments',true),('vet','files',true),('vet','definitions',false),('vet','reports',false),
 ('reception','customers',true),('reception','appointments',true),('reception','clinical',false),('reception','files',true),('reception','definitions',false),
 ('accountant','finance',true),('accountant','inventory',true),('accountant','customers',false),('accountant','reports',false),('accountant','definitions',false),
 ('reader','clinical',false),('reader','customers',false),('reader','appointments',false),('reader','reports',false),('reader','definitions',false);

create function private.is_owner() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role='owner');
$$;
create function private.entitled() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.clinic_settings s where s.status='paid' or (s.status='trial' and s.trial_ends_at>now()));
$$;
create function private.allowed(scope text, writing boolean, branch uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.entitled() and exists (
 select 1 from public.profiles p where p.id=auth.uid() and p.active and
 (p.role='owner' or ((branch is null or p.branch_id=branch) and exists(
 select 1 from private.role_permissions r where r.role=p.role and r.scope=$1 and (not $2 or r.can_write)))));
$$;
create function private.require_access(scope text, writing boolean, branch uuid) returns void language plpgsql stable security definer set search_path='' as $$
begin if not private.allowed(scope,writing,branch) then raise exception 'Bu işlem için yetki veya aktif abonelik gerekiyor.' using errcode='42501'; end if; end;
$$;
create function private.branch() returns uuid language sql stable security definer set search_path='' as $$
 select p.branch_id from public.profiles p where p.id=auth.uid() and p.active;
$$;

alter table public.clinic_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.branches enable row level security;
create policy settings_read on public.clinic_settings for select to authenticated using(exists(select 1 from public.profiles where id=auth.uid()));
create policy profile_read on public.profiles for select to authenticated using(id=auth.uid() or private.is_owner());
create policy branch_read on public.branches for select to authenticated using(private.allowed('definitions',false,id));
grant select on public.clinic_settings,public.profiles,public.branches to authenticated;
grant all on public.clinic_settings,public.profiles,public.branches to service_role;
revoke all on all functions in schema private from public;
grant execute on all functions in schema private to authenticated, service_role;

create table private.audit_log(id bigint generated always as identity primary key, actor uuid, operation text not null, entity text not null, record_id text, at timestamptz not null default now());
create function private.audit_change() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into private.audit_log(actor,operation,entity,record_id) values(auth.uid(),tg_op,tg_table_name,coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id'));return coalesce(new,old);end;
$$;

-- Idempotency is scoped to both actor and operation, and includes the request body.
create table private.operation_receipts(actor uuid not null, operation text not null, key uuid not null, request jsonb not null, result jsonb not null, created_at timestamptz not null default now(), primary key(actor,operation,key));
