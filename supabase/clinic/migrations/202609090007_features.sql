create table public.cheques (
 id uuid primary key default gen_random_uuid(),branch_id uuid not null references public.branches(id),customer_id uuid references public.vetcustomers(id),
 number text not null,bank text not null default '',amount numeric not null check(amount>0),due_date date not null,
 status text not null default 'portfolio' check(status in ('portfolio','deposited','collected','returned','cancelled')),note text not null default '',created_at timestamptz not null default now()
);
alter table public.cheques enable row level security;
create policy cheque_read on public.cheques for select to authenticated using(private.allowed('finance',false,branch_id));
grant select on public.cheques to authenticated;grant all on public.cheques to service_role;
create function public.save_cheque(p_data jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare target uuid;branch uuid;current_status text;next_status text:=coalesce(p_data->>'status','portfolio');
begin
 target:=nullif(p_data->>'id','')::uuid;branch:=coalesce(nullif(p_data->>'branch_id','')::uuid,private.branch());
 if target is not null then select c.branch_id,c.status into branch,current_status from public.cheques c where id=target for update;if not found then raise exception 'Çek bulunamadı';end if;end if;
 perform private.require_access('finance',true,branch);
 if current_status in ('collected','cancelled') then raise exception 'Kapanmış çek değiştirilemez';end if;
 if target is null then insert into public.cheques(branch_id,customer_id,number,bank,amount,due_date,status,note) values(branch,nullif(p_data->>'customer_id','')::uuid,p_data->>'number',coalesce(p_data->>'bank',''),(p_data->>'amount')::numeric,(p_data->>'due_date')::date,next_status,coalesce(p_data->>'note','')) returning id into target;
 else update public.cheques set number=coalesce(p_data->>'number',number),bank=coalesce(p_data->>'bank',bank),amount=coalesce((p_data->>'amount')::numeric,amount),due_date=coalesce((p_data->>'due_date')::date,due_date),status=next_status,note=coalesce(p_data->>'note',note) where id=target;end if;
 return target;
end;$$;
revoke all on function public.save_cheque(jsonb) from public;grant execute on function public.save_cheque(jsonb) to authenticated;

create table public.message_outbox (
 id uuid primary key default gen_random_uuid(),branch_id uuid not null references public.branches(id),actor uuid not null references auth.users(id),
 channel text not null check(channel in ('sms','email')),recipient text not null,subject text not null default '',body text not null,
 state text not null default 'queued' check(state in ('queued','sending','sent','delivered','failed','unknown')),
 provider_id text,safe_error text,request_key uuid not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(actor,request_key,recipient)
);
insert into private.role_permissions values('vet','messages',true),('reception','messages',true);
alter table public.message_outbox enable row level security;
create policy outbox_read on public.message_outbox for select to authenticated using(private.allowed('messages',false,branch_id));
grant select on public.message_outbox to authenticated;grant all on public.message_outbox to service_role;
create function public.enqueue_message(p_channel text,p_recipients text[],p_subject text,p_body text,p_key uuid) returns integer language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 perform private.require_access('messages',true,private.branch());
 if p_key is null or length(trim(p_body))=0 or length(p_body)>10000 or cardinality(p_recipients) not between 1 and 100 then raise exception 'Mesaj veya alıcı sayısı geçersiz';end if;
 if p_channel not in ('sms','email') then raise exception 'Geçersiz kanal';end if;
 if exists(select 1 from unnest(p_recipients) r where (p_channel='sms' and r !~ '^\+?[0-9]{10,15}$') or (p_channel='email' and r !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')) then raise exception 'Geçersiz alıcı';end if;
 if exists(select 1 from public.message_outbox where actor=auth.uid() and request_key=p_key and (body<>p_body or channel<>p_channel or subject<>coalesce(p_subject,''))) then raise exception 'İşlem anahtarı farklı içerikle kullanılmış';end if;
 insert into public.message_outbox(branch_id,actor,channel,recipient,subject,body,request_key) select private.branch(),auth.uid(),p_channel,r,coalesce(p_subject,''),p_body,p_key from (select distinct unnest(p_recipients) r) recipients on conflict(actor,request_key,recipient) do nothing;
 get diagnostics n=row_count;return n;
end;$$;
revoke all on function public.enqueue_message(text,text[],text,text,uuid) from public;grant execute on function public.enqueue_message(text,text[],text,text,uuid) to authenticated;

create function public.clinic_access(p_scope text,p_write boolean default false) returns boolean language sql stable security definer set search_path='' as $$select private.allowed(p_scope,p_write,private.branch());$$;
revoke all on function public.clinic_access(text,boolean) from public;grant execute on function public.clinic_access(text,boolean) to authenticated;

create function public.clinic_report(p_kind text,p_from date,p_to date,p_branch uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;tz text;
begin
 if p_from is null or p_to is null or p_from>p_to then raise exception 'Geçersiz tarih aralığı';end if;
 perform private.require_access('reports',false,coalesce(p_branch,private.branch()));
 perform private.require_access(case p_kind when 'sales' then 'finance' when 'collections' then 'finance' when 'stock' then 'inventory' else 'appointments' end,false,coalesce(p_branch,private.branch()));
 select timezone into tz from public.clinic_settings;
 if p_kind='sales' then
  select coalesce(jsonb_agg(jsonb_build_object('Tarih',s.date,'Belge',s."invoiceNo",'Tür',s.type,'Net',s."netPrice",'KDV',s."kDV",'İndirim',s.discount,'Toplam',s.total) order by s.date),'[]') into result from public.vetsalebuyowner s where not s.deleted and (s.date at time zone tz)::date between p_from and p_to and (p_branch is null or s.branch_id=p_branch) and private.allowed('reports',false,s.branch_id);
 elsif p_kind='collections' then
  select coalesce(jsonb_agg(jsonb_build_object('Tarih',c.date,'Açıklama',c.remark,'Tutar',c.total) order by c.date),'[]') into result from public.vetpaymentcollection c where not c.deleted and (c.date at time zone tz)::date between p_from and p_to and (p_branch is null or c.branch_id=p_branch) and private.allowed('reports',false,c.branch_id);
 elsif p_kind='appointments' then
  select coalesce(jsonb_agg(jsonb_build_object('Başlangıç',a."beginDate",'Bitiş',a."endDate",'Not',a.note,'Tamamlandı',a."isCompleted") order by a."beginDate"),'[]') into result from public.vetappoointments a where not a.deleted and (a."beginDate" at time zone tz)::date between p_from and p_to and (p_branch is null or a.branch_id=p_branch) and private.allowed('reports',false,a.branch_id);
 elsif p_kind='stock' then
  select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from (select p.name as "Ürün",coalesce(sum(l.quantity) filter(where (l.created_at at time zone tz)::date<p_from),0) as "Devir",coalesce(sum(l.quantity) filter(where (l.created_at at time zone tz)::date between p_from and p_to),0) as "Hareket",coalesce(sum(l.quantity),0) as "Kapanış" from public.vetproducts p left join public.stock_ledger l on l.product_id=p.id and (l.created_at at time zone tz)::date<=p_to where not p.deleted and (p_branch is null or p.branch_id=p_branch) and private.allowed('reports',false,p.branch_id) group by p.id,p.name) t;
 else raise exception 'Geçersiz rapor türü';end if;
 return result;
end;$$;
revoke all on function public.clinic_report(text,date,date,uuid) from public;grant execute on function public.clinic_report(text,date,date,uuid) to authenticated;
