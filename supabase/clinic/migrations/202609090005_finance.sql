create table public.stock_ledger (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.vetproducts(id),
 branch_id uuid not null references public.branches(id), quantity numeric not null check(quantity<>0),
 sale_id uuid references public.vetsalebuyowner(id), stock_record_id uuid references public.vetstocktracking(id),
 reversal_of uuid unique references public.stock_ledger(id), reason text not null, created_at timestamptz not null default now()
);
alter table public.stock_ledger enable row level security;
create policy stock_read on public.stock_ledger for select to authenticated using(private.allowed('inventory',false,branch_id));
grant select on public.stock_ledger to authenticated;
grant all on public.stock_ledger to service_role;
create index on public.stock_ledger(product_id,branch_id);
alter table public.vetsalebuytrans alter column quantity type numeric;
alter table public.vetsalebuytrans add constraint sale_line_parent foreign key("ownerId") references public.vetsalebuyowner(id);
alter table public.vetpaymentcollection add constraint payment_parent foreign key("saleBuyId") references public.vetsalebuyowner(id);

-- Mirrors Decimal MidpointRounding.ToEven used for invoice totals in the source.
create function private.round_even(value numeric,places integer default 2) returns numeric language plpgsql immutable set search_path='' as $$
declare factor numeric:=power(10::numeric,places); scaled numeric:=abs(value)*factor; rounded numeric;
begin
 if scaled-trunc(scaled)=0.5 then rounded:=trunc(scaled)+mod(trunc(scaled),2);else rounded:=round(scaled);end if;
 return sign(value)*rounded/factor;
end;$$;

create function private.stock_change(product uuid,branch uuid,quantity numeric,reason text,sale uuid default null,stock_record uuid default null) returns void language plpgsql security definer set search_path='' as $$
declare product_branch uuid; balance numeric;
begin
 select branch_id into product_branch from public.vetproducts where id=product and not deleted for update;
 if not found or product_branch is distinct from branch then raise exception 'Ürün/şube eşleşmiyor';end if;
 select coalesce(sum(l.quantity),0) into balance from public.stock_ledger l where l.product_id=product and l.branch_id=branch;
 if balance+quantity<0 then raise exception 'Yetersiz stok';end if;
 insert into public.stock_ledger(product_id,branch_id,quantity,sale_id,stock_record_id,reason) values(product,branch,quantity,sale,stock_record,reason);
end;$$;

create function private.create_sale(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare branch uuid:=coalesce(nullif(payload->>'branch_id','')::uuid,private.branch());
 header public.vetsalebuyowner; product public.vetproducts; item jsonb; lines jsonb; count numeric; unit_price numeric; rate numeric; vat numeric; net numeric; discount numeric; included boolean; kind integer:=coalesce((payload->>'type')::int,1);
begin
 perform private.require_access('finance',true,branch);
 if kind not in (1,2) then raise exception 'Geçersiz işlem türü';end if;
 if nullif(payload->>'customerId','') is not null and payload->>'customerId'<>'00000000-0000-0000-0000-000000000000' and not exists(select 1 from public.vetcustomers where id=(payload->>'customerId')::uuid and branch_id=branch and not deleted) then raise exception 'Müşteri bulunamadı';end if;
 lines:=payload->'trans';
 if lines is null and payload ? 'productId' then lines:=jsonb_build_array(jsonb_build_object('product',payload->>'productId','quantity',payload->'amount'));end if;
 if coalesce(jsonb_array_length(lines),0)=0 and coalesce((payload->>'price')::numeric,0)<=0 then raise exception 'Satış kalemi zorunlu';end if;
 insert into public.vetsalebuyowner(branch_id,type,"customerId","supplierId",date,remark,"examinationsId","isExaminations","accomodationId","isAccomodation")
 values(branch,kind,nullif(nullif(payload->>'customerId',''),'00000000-0000-0000-0000-000000000000')::uuid,nullif(nullif(payload->>'supplierId',''),'00000000-0000-0000-0000-000000000000')::uuid,coalesce((payload->>'date')::timestamptz,now()),coalesce(payload->>'remark',''),nullif(nullif(payload->>'examinationId',''),'00000000-0000-0000-0000-000000000000')::uuid,coalesce((payload->>'isExaminations')::boolean,false),nullif(payload->>'accomodationId','')::uuid,coalesce((payload->>'isAccomodation')::boolean,false)) returning * into header;
 -- Lock products in stable order before applying any quantities.
 perform p.id from public.vetproducts p where p.id in (select coalesce(x->>'product',x->>'productId')::uuid from jsonb_array_elements(coalesce(lines,'[]')) x) order by p.id for update;
 for item in select value from jsonb_array_elements(coalesce(lines,'[]')) loop
  select * into product from public.vetproducts where id=coalesce(item->>'product',item->>'productId')::uuid and not deleted and branch_id=branch;
  if not found then raise exception 'Ürün bulunamadı';end if;
  count:=(item->>'quantity')::numeric;discount:=coalesce((item->>'discount')::numeric,0);
  if count is null or count<=0 or discount<0 then raise exception 'Miktar pozitif, indirim sıfır veya pozitif olmalı';end if;
  unit_price:=case when kind=1 then product."sellingPrice" else product."buyingPrice" end;
  included:=case when kind=1 then product."sellingIncludeKDV" else product."buyingIncludeKDV" end;
  select coalesce("taxRatio",0) into rate from public.vettaxis where id=product."taxisId" and not deleted;
  rate:=coalesce(rate,0);
  vat:=case when coalesce(included,false) then trunc(unit_price*count-unit_price*count/(1+rate/100),2) else unit_price*count*rate/100 end;
  net:=private.round_even(unit_price*count)-case when coalesce(included,false) then vat else 0 end;
  if unit_price<0 or net+vat<discount then raise exception 'Geçersiz fiyat veya indirim';end if;
  insert into public.vetsalebuytrans(branch_id,"ownerId","productId",quantity,amount,price,discount,"netPrice","vatAmount","vatIncluded","taxisId") values(branch,header.id,product.id,count,count,unit_price,discount,net,vat,included,product."taxisId");
  if product."productTypeId"<>3 then perform private.stock_change(product.id,branch,case when kind=1 then -count else count end,'invoice',header.id);end if;
 end loop;
 if coalesce((payload->>'price')::numeric,0)>0 then
  insert into public.vetsalebuytrans(branch_id,"ownerId",quantity,amount,price,"netPrice",discount,"vatAmount") values(branch,header.id,1,1,(payload->>'price')::numeric,private.round_even((payload->>'price')::numeric),0,0);
 end if;
 update public.vetsalebuyowner h set "invoiceNo"='#'||h."recId", "netPrice"=t.net, "kDV"=t.vat,discount=t.discount,total=t.net+t.vat-t.discount from
 (select private.round_even(sum(l."netPrice")) net,private.round_even(sum(l."vatAmount")) vat,private.round_even(sum(l.discount)) discount from public.vetsalebuytrans l where l."ownerId"=header.id) t where h.id=header.id returning h.* into header;
 return jsonb_build_object('id',header.id,'amount',header.total);
end;$$;

create function private.collect_sale(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare sale public.vetsalebuyowner; amount numeric:=(payload->>'amount')::numeric; paid numeric;
begin
 select * into sale from public.vetsalebuyowner where id=coalesce(payload->>'saleOwnerId',payload->>'saleBuyId')::uuid and not deleted for update;
 if not found then raise exception 'Satış bulunamadı';end if;
 perform private.require_access('finance',true,sale.branch_id);
 if amount is null or amount<=0 then raise exception 'Tahsilat tutarı pozitif olmalı';end if;
 select coalesce(sum(total),0) into paid from public.vetpaymentcollection where "saleBuyId"=sale.id and not deleted;
 if paid+amount>sale.total then raise exception 'Tahsilat kalan borcu aşamaz';end if;
 insert into public.vetpaymentcollection(branch_id,"customerId","saleBuyId",date,remark,credit,paid,"totalPaid",total,"paymetntId")
 values(sale.branch_id,sale."customerId",sale.id,coalesce((payload->>'date')::timestamptz,now()),coalesce(payload->>'remark',''),amount,amount,amount,amount,(payload->>'paymentId')::integer);
 return 'true';
end;$$;

create function private.cancel_sale(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare sale public.vetsalebuyowner; entry public.stock_ledger;
begin
 select * into sale from public.vetsalebuyowner where id=(payload->>'id')::uuid for update;
 if not found then raise exception 'Satış bulunamadı';end if;
 perform private.require_access('finance',true,sale.branch_id);
 if sale.deleted then return 'true';end if;
 if exists(select 1 from public.vetpaymentcollection where "saleBuyId"=sale.id and not deleted) then raise exception 'Önce tahsilatı iptal edin';end if;
 for entry in select * from public.stock_ledger where sale_id=sale.id and reversal_of is null order by product_id loop
  perform id from public.vetproducts where id=entry.product_id for update;
  if (select coalesce(sum(quantity),0) from public.stock_ledger where product_id=entry.product_id and branch_id=entry.branch_id)-entry.quantity<0 then raise exception 'İptal stok miktarını negatif yapar';end if;
  insert into public.stock_ledger(product_id,branch_id,quantity,reversal_of,sale_id,reason) values(entry.product_id,entry.branch_id,-entry.quantity,entry.id,sale.id,'invoice reversal');
 end loop;
 update public.vetsalebuyowner set deleted=true where id=sale.id;
 update public.vetsalebuytrans set deleted=true where "ownerId"=sale.id;
 return 'true';
end;$$;

revoke all on function private.round_even(numeric,integer),private.stock_change(uuid,uuid,numeric,text,uuid,uuid),private.create_sale(jsonb),private.collect_sale(jsonb),private.cancel_sale(jsonb) from public,authenticated;
