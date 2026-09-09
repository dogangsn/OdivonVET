create unique index active_appointment_sale on public.vetsalebuyowner("appointmentId") where not deleted and "appointmentId" is not null;
alter function private.commercial_operation(text,jsonb) rename to commercial_before_appointment_collection;
create function private.commercial_operation(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare appointment public.vetappoointments;definition public.vetappointmenttypes;vaccine public.vetvaccine;result jsonb;lines jsonb;price numeric;configured numeric;custom boolean:=coalesce((payload->>'enterAmount')::boolean,false);
begin
 if action<>'createcollection' then return private.commercial_before_appointment_collection(action,payload);end if;
 if nullif(payload->>'collectionId','') is null then raise exception 'Tahsilat için randevu seçin';end if;
 select * into appointment from public.vetappoointments where id=(payload->>'collectionId')::uuid and not deleted for update;
 if not found then raise exception 'Randevu bulunamadı';end if;
 perform private.require_access('finance',true,appointment.branch_id);
 if not appointment."isCompleted" or appointment."isPaymentReceived" or exists(select 1 from public.vetsalebuyowner where "appointmentId"=appointment.id and not deleted) then raise exception 'Randevu tamamlanmamış veya zaten ücretlendirilmiş';end if;
 if (payload->>'customerId')::uuid is distinct from appointment."customerId" then raise exception 'Müşteri ve randevu eşleşmiyor';end if;
 select * into definition from public.vetappointmenttypes where type=appointment."appointmentType" and branch_id=appointment.branch_id and not deleted order by "recId" limit 1;
 if appointment."vaccineId" is not null then
  select * into vaccine from public.vetvaccine where id=appointment."vaccineId" and branch_id=appointment.branch_id and not deleted;
  if not found then raise exception 'Aşı tanımı bulunamadı';end if;
  select sum(m.quantity*p."sellingPrice") into configured from public.vetvaccinemedicine m join public.vetproducts p on p.id=m."productId" and p.branch_id=m.branch_id and not p.deleted where m."vaccineId"=vaccine.id and not m.deleted;
  if coalesce(configured,0)<=0 then raise exception 'Aşı ürünlerini ve fiyatlarını tanımlayın';end if;
  price:=case when custom then (payload->>'amount')::numeric else configured end;
  if price is null or price<=0 or price::text in ('NaN','Infinity','-Infinity') then raise exception 'Geçerli tutar girin';end if;
  select jsonb_agg(jsonb_build_object('product',p.id,'quantity',m.quantity,'unitPrice',p."sellingPrice"*price/configured,'vat',case when custom then nullif(payload->>'taxisId','') else null end)) into lines from public.vetvaccinemedicine m join public.vetproducts p on p.id=m."productId" and p.branch_id=m.branch_id and not p.deleted where m."vaccineId"=vaccine.id and not m.deleted;
  result:=private.create_sale(jsonb_build_object('customerId',appointment."customerId",'branch_id',appointment.branch_id,'paymentType',payload->'paymentType','type',1,'trans',lines));
 else
  price:=case when custom or not coalesce(definition."isDefaultPrice",false) then (payload->>'amount')::numeric else definition.price end;
  if price is null or price<=0 or price::text in ('NaN','Infinity','-Infinity') then raise exception 'Geçerli tutar girin';end if;
  result:=private.create_sale(jsonb_build_object('customerId',appointment."customerId",'branch_id',appointment.branch_id,'paymentType',payload->'paymentType','type',1,'price',price,'serviceTaxId',case when custom then nullif(payload->>'taxisId','')::uuid else definition."taxisId" end));
 end if;
 update public.vetsalebuyowner set "appointmentId"=appointment.id,"isAppointment"=true where id=(result->>'id')::uuid;
 perform private.collect_sale(jsonb_build_object('saleBuyId',result->>'id','amount',result->'amount','paymentId',payload->'paymentType'));
 update public.vetpaymentcollection set "collectionId"=appointment.id where "saleBuyId"=(result->>'id')::uuid and not deleted;
 update public.vetappoointments set "isPaymentReceived"=true,"updateDate"=now() where id=appointment.id;
 return to_jsonb(result->>'id');
end;$$;
revoke all on function private.commercial_operation(text,jsonb) from public,authenticated;

alter function private.read_operation(text,text,jsonb) rename to read_operation_before_appointment_collection;
create function private.read_operation(action text,entity text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if action='getpaymenttransactionlist' then
  perform private.require_access('finance',false,private.branch());
  return (select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'appointmentType',a."appointmentType",'vaccineid',a."vaccineId",'textValue',concat_ws(' / ',t.remark,v."vaccineName"),'isDefaultPrice',coalesce(t."isDefaultPrice",false),'price',t.price,'sellingPrice',coalesce(v."totalSaleAmount",t.price,0),'taxisId',t."taxisId") order by a."beginDate"),'[]') from public.vetappoointments a left join public.vetappointmenttypes t on t.type=a."appointmentType" and t.branch_id=a.branch_id and not t.deleted left join public.vetvaccine v on v.id=a."vaccineId" and v.branch_id=a.branch_id and not v.deleted where not a.deleted and a."isCompleted" and not a."isPaymentReceived" and a."customerId"=(payload->>'customerId')::uuid and private.allowed('finance',false,a.branch_id) and not exists(select 1 from public.vetsalebuyowner where "appointmentId"=a.id and not deleted));
 end if;
 return private.read_operation_before_appointment_collection(action,entity,payload);
end;$$;
revoke all on function private.read_operation(text,text,jsonb) from public,authenticated;
