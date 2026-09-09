create function private.stock_operation(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare item jsonb;old public.vetstocktracking;target uuid;desired numeric;current_quantity numeric;kind integer;
begin
 target:=nullif(payload->>'id','')::uuid;
 if action<>'createstocktracking' then
  select * into old from public.vetstocktracking where id=target and not deleted for update;
  if not found then raise exception 'Stok kaydı bulunamadı';end if;
  perform private.require_access('inventory',true,old.branch_id);
  payload:=payload||jsonb_build_object('productId',old."productId",'branch_id',old.branch_id);
 end if;
 if action='deletestocktracking' then desired:=0;
 else
  kind:=coalesce((payload->>'type')::int,1);
  if kind not in (1,2) or coalesce((payload->>'piece')::numeric,0)<=0 then raise exception 'Geçersiz stok yönü veya miktarı';end if;
  desired:=(payload->>'piece')::numeric*case when kind=1 then 1 else -1 end;
 end if;
 item:=private.save_entity('vetstocktracking',payload,case action when 'createstocktracking' then 'create' when 'updatestocktracking' then 'update' else 'delete' end);
 perform id from public.vetproducts where id=(item->>'productId')::uuid for update;
 select coalesce(sum(quantity),0) into current_quantity from public.stock_ledger where stock_record_id=(item->>'id')::uuid;
 if desired<>current_quantity then perform private.stock_change((item->>'productId')::uuid,(item->>'branch_id')::uuid,desired-current_quantity,'stock adjustment',null,(item->>'id')::uuid);end if;
 update public.vetstocktracking set "remainingPiece"=greatest(desired,0) where id=(item->>'id')::uuid;
 return 'true';
end;$$;

create function private.commercial_operation(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare old public.vetsalebuyowner;payment public.vetpaymentcollection;result jsonb;sale public.vetsalebuyowner;amount numeric;remaining numeric;due numeric;
begin
 if action in ('updatesale','updatesalebuy') then
  select * into old from public.vetsalebuyowner where id=(payload->>'id')::uuid and not deleted for update;
  if not found then raise exception 'Satış bulunamadı';end if;
  perform private.cancel_sale(jsonb_build_object('id',old.id));
  -- A revision retains the cancelled invoice and creates an auditable replacement.
  return private.create_sale(to_jsonb(old)||payload||jsonb_build_object('branch_id',old.branch_id,'customerId',old."customerId",'examinationId',old."examinationsId",'type',old.type));
 elsif action='updatesalecollection' then
  select * into payment from public.vetpaymentcollection where id=(payload->>'id')::uuid and not deleted for update;
  if not found then raise exception 'Tahsilat bulunamadı';end if;
  perform private.require_access('finance',true,payment.branch_id);
  perform private.save_entity('vetpaymentcollection',jsonb_build_object('id',payment.id),'delete');
  return private.collect_sale(payload||jsonb_build_object('saleBuyId',payment."saleBuyId"));
 elsif action in ('deletecollection','deletepaychart') then
  select * into payment from public.vetpaymentcollection where id=(payload->>'id')::uuid and not deleted for update;
  if not found then raise exception 'Tahsilat bulunamadı';end if;
  perform id from public.vetsalebuyowner where id=payment."saleBuyId" for update;
  return private.save_entity('vetpaymentcollection',payload,'delete');
 elsif action='createbalancesalecollection' then
  remaining:=(payload->>'amount')::numeric;
  if remaining is null or remaining<=0 then raise exception 'Tahsilat pozitif olmalı';end if;
  perform private.require_access('finance',true,private.branch());
  for sale in select * from public.vetsalebuyowner where "customerId"=(payload->>'customerId')::uuid and type=1 and not deleted and private.allowed('finance',true,branch_id) order by date,id for update loop
   select sale.total-coalesce(sum(total),0) into due from public.vetpaymentcollection where "saleBuyId"=sale.id and not deleted;
   amount:=least(due,remaining);
   if amount>0 then perform private.collect_sale(payload||jsonb_build_object('saleBuyId',sale.id,'amount',amount));remaining:=remaining-amount;end if;
   exit when remaining=0;
  end loop;
  if remaining>0 then raise exception 'Tahsilat kalan borcu aşamaz';end if;
  return 'true';
 elsif action='createcollection' then
  result:=private.create_sale(jsonb_build_object('customerId',payload->>'customerId','type',1,'price',payload->'amount','date',now()));
  perform private.collect_sale(jsonb_build_object('saleBuyId',result->>'id','amount',result->'amount','paymentId',payload->'paymentType'));
  return to_jsonb(result->>'id');
 end if;
 raise exception 'Tanımsız ticari işlem';
end;$$;
revoke all on function private.stock_operation(text,jsonb),private.commercial_operation(text,jsonb) from public,authenticated;
