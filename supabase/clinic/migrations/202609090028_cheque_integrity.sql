create table private.cheque_requests(actor uuid not null,key uuid not null,request jsonb not null,result uuid not null,branch_id uuid,member_role text,primary key(actor,key));
alter function public.save_cheque(jsonb) rename to save_cheque_record;
alter function public.save_cheque_record(jsonb) set schema private;
revoke all on function private.save_cheque_record(jsonb) from public,authenticated;
create function public.save_cheque(p_data jsonb,p_key uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare saved private.cheque_requests;branch uuid;target uuid;
begin
 if p_key is null then raise exception 'İşlem anahtarı zorunlu';end if;
 branch:=coalesce(nullif(p_data->>'branch_id','')::uuid,private.branch());
 if nullif(p_data->>'id','') is not null then select branch_id into branch from public.cheques where id=(p_data->>'id')::uuid;end if;
 perform private.require_access('finance',true,branch);
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_key::text,0));
 select * into saved from private.cheque_requests where actor=auth.uid() and key=p_key;
 if found then
  if saved.request<>p_data then raise exception 'İşlem anahtarı farklı içerikle kullanılmış';end if;
  if saved.member_role is distinct from (select role from public.profiles where id=auth.uid()) or saved.branch_id is distinct from private.branch() then raise exception 'Üyelik veya şube değişmiş' using errcode='42501';end if;
  return saved.result;
 end if;
 if nullif(p_data->>'customer_id','') is not null and not exists(select 1 from public.vetcustomers where id=(p_data->>'customer_id')::uuid and not deleted and branch_id=branch) then raise exception 'Müşteri ve şube eşleşmiyor';end if;
 if p_data ? 'number' and length(btrim(coalesce(p_data->>'number','')))=0 then raise exception 'Çek numarası zorunlu';end if;
 target:=private.save_cheque_record(p_data);
 insert into private.cheque_requests values(auth.uid(),p_key,p_data,target,private.branch(),(select role from public.profiles where id=auth.uid()));
 return target;
end;$$;
revoke all on function public.save_cheque(jsonb,uuid) from public;grant execute on function public.save_cheque(jsonb,uuid) to authenticated;
create trigger audit_cheques after insert or update on public.cheques for each row execute function private.audit_change();

create function private.file_patient_owner() returns trigger language plpgsql set search_path='' as $$
begin
 if new.patient_id is not null and not exists(select 1 from public.vetpatients p where p.id=new.patient_id and not p.deleted and p.branch_id=new.branch_id and (new.customer_id is null or p."customerId"=new.customer_id)) then raise exception 'Dosyanın hasta, müşteri ve şubesi eşleşmiyor';end if;
 return new;
end;$$;
create trigger file_patient_owner before insert or update on public.clinic_files for each row execute function private.file_patient_owner();
revoke all on function private.file_patient_owner() from public,authenticated;
