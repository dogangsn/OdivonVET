create or replace function private.create_sale_before_relations(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare branch uuid:=coalesce(nullif(payload->>'branch_id','')::uuid,private.branch());
 header public.vetsalebuyowner; product public.vetproducts; item jsonb; lines jsonb; count numeric; unit_price numeric; rate numeric; vat numeric; net numeric; discount numeric; included boolean; tax_id uuid; kind integer:=coalesce((payload->>'type')::int,1);
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
  if count is null or count<=0 or discount<0 or count::text in ('NaN','Infinity','-Infinity') or discount::text in ('NaN','Infinity','-Infinity') then raise exception 'Miktar pozitif, indirim sıfır veya pozitif olmalı';end if;
  unit_price:=coalesce((item->>'unitPrice')::numeric,case when kind=1 then product."sellingPrice" else product."buyingPrice" end);
  if unit_price is null or unit_price<0 or unit_price::text in ('NaN','Infinity','-Infinity') then raise exception 'Geçersiz birim fiyat';end if;
  included:=case when kind=1 then product."sellingIncludeKDV" else product."buyingIncludeKDV" end;
  tax_id:=coalesce(nullif(item->>'vat','')::uuid,product."taxisId");
  select "taxRatio" into rate from public.vettaxis where id=tax_id and not deleted and branch_id=branch;
  if tax_id is not null and not found then raise exception 'Vergi ve şube eşleşmiyor';end if;
  if rate<0 or rate>100 or rate::text in ('NaN','Infinity','-Infinity') then raise exception 'Geçersiz vergi oranı';end if;
  rate:=coalesce(rate,0);
  vat:=case when coalesce(included,false) then trunc(unit_price*count-unit_price*count/(1+rate/100),2) else unit_price*count*rate/100 end;
  net:=private.round_even(unit_price*count)-case when coalesce(included,false) then vat else 0 end;
  if unit_price<0 or net+vat<discount then raise exception 'Geçersiz fiyat veya indirim';end if;
  insert into public.vetsalebuytrans(branch_id,"ownerId","productId",quantity,amount,price,discount,"netPrice","vatAmount","vatIncluded","taxisId") values(branch,header.id,product.id,count,count,unit_price,discount,net,vat,included,tax_id);
  if product."productTypeId"<>3 then perform private.stock_change(product.id,branch,case when kind=1 then -count else count end,'invoice',header.id);end if;
 end loop;
 if coalesce((payload->>'price')::numeric,0)>0 then
  unit_price:=(payload->>'price')::numeric;
  if unit_price::text in ('NaN','Infinity','-Infinity') then raise exception 'Geçersiz hizmet tutarı';end if;
  tax_id:=nullif(payload->>'serviceTaxId','')::uuid;
  select "taxRatio" into rate from public.vettaxis where id=tax_id and not deleted and branch_id=branch;
  if tax_id is not null and not found then raise exception 'Vergi ve şube eşleşmiyor';end if;
  if rate<0 or rate>100 or rate::text in ('NaN','Infinity','-Infinity') then raise exception 'Geçersiz vergi oranı';end if;
  vat:=private.round_even(unit_price*coalesce(rate,0)/100);
  insert into public.vetsalebuytrans(branch_id,"ownerId",quantity,amount,price,"netPrice",discount,"vatAmount","taxisId") values(branch,header.id,1,1,unit_price,private.round_even(unit_price),0,vat,tax_id);
 end if;
 update public.vetsalebuyowner h set "invoiceNo"='#'||h."recId", "netPrice"=t.net, "kDV"=t.vat,discount=t.discount,total=t.net+t.vat-t.discount from
 (select private.round_even(sum(l."netPrice")) net,private.round_even(sum(l."vatAmount")) vat,private.round_even(sum(l.discount)) discount from public.vetsalebuytrans l where l."ownerId"=header.id) t where h.id=header.id returning h.* into header;
 return jsonb_build_object('id',header.id,'amount',header.total);
end;$$;


revoke all on function private.create_sale_before_relations(jsonb) from public,authenticated;
