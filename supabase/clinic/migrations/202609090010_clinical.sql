create function private.check_patient_owner() returns trigger language plpgsql set search_path='' as $$
declare patient uuid:=coalesce(to_jsonb(new)->>'patientId',to_jsonb(new)->>'patientsId')::uuid;
begin
 if patient is not null and not exists(select 1 from public.vetpatients p where p.id=patient and not p.deleted and p.branch_id=new.branch_id and (new."customerId" is null or p."customerId"=new."customerId")) then raise exception 'Hasta, müşteri ve şube eşleşmiyor';end if;
 return new;
end;$$;
create trigger examination_owner before insert or update on public.vetexamination for each row execute function private.check_patient_owner();
create trigger appointment_owner before insert or update on public.vetappoointments for each row execute function private.check_patient_owner();
create trigger accommodation_owner before insert or update on public.vetaccomodation for each row execute function private.check_patient_owner();
create trigger vaccine_owner before insert or update on public.vetvaccinecalendar for each row execute function private.check_patient_owner();

alter function private.clinical_operation(text,jsonb) rename to clinical_operation_base;
create function private.clinical_operation(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare record jsonb; child jsonb; sale jsonb; old_sale uuid; target uuid; branch uuid; room public.vetrooms; stay public.vetaccomodation; due numeric; checkout timestamptz;
begin
 if action in ('createpatient','updatepatient') then
  child:=coalesce(payload->'patientDetails',payload)||jsonb_build_object('customerId',payload->>'customerId');
  if coalesce((child->>'animalType')::int,0)=0 then raise exception 'Hayvan türü zorunlu';end if;
  return private.save_entity('vetpatients',child,case when action='createpatient' then 'create' else 'update' end);
 elsif action='updatecustomerbyid' then
  payload:=payload||jsonb_build_object('adress',jsonb_build_object('province',payload->>'city','district',payload->>'district','longAdress',payload->>'longadress'));
  return private.save_entity('vetcustomers',payload,'update');
 elsif action='updatepatientsweight' then
  if coalesce((payload->>'weight')::numeric,0)<=0 then raise exception 'Ağırlık pozitif olmalı';end if;
  return private.save_entity('vetweightcontrol',payload||jsonb_build_object('controlDate',now()),'create');
 elsif action in ('createexamination','updateexamination','deleteexamination') then
  if action='deleteexamination' then
   target:=(payload->>'id')::uuid;
   select id into old_sale from public.vetsalebuyowner where "examinationsId"=target and not deleted for update;
   if old_sale is not null then perform private.cancel_sale(jsonb_build_object('id',old_sale));end if;
   return private.save_entity('vetexamination',payload,'delete');
  end if;
  if coalesce(payload->>'status','') in ('Aktif','Tamamlandı','Bekliyor','İptal') then payload:=payload||jsonb_build_object('status',case payload->>'status' when 'Aktif' then 0 when 'Tamamlandı' then 1 when 'Bekliyor' then 2 else 3 end);end if;
  record:=private.save_entity('vetexamination',payload,case when action='createexamination' then 'create' else 'update' end);
  target:=(record->>'id')::uuid;
  if action='updateexamination' and (payload ? 'price' or payload ? 'trans') then
   select id into old_sale from public.vetsalebuyowner where "examinationsId"=target and not deleted for update;
   if old_sale is not null then perform private.cancel_sale(jsonb_build_object('id',old_sale));end if;
  end if;
  if coalesce(jsonb_array_length(payload->'trans'),0)>0 or coalesce((payload->>'price')::numeric,0)>0 then
   sale:=private.create_sale(payload||jsonb_build_object('customerId',record->>'customerId','branch_id',record->>'branch_id','examinationId',target,'isExaminations',true,'type',1));
  end if;
  if coalesce((payload->>'weight')::numeric,0)>0 then perform private.save_entity('vetweightcontrol',jsonb_build_object('patientId',record->>'patientId','weight',payload->'weight','controlDate',now(),'branch_id',record->>'branch_id'),'create');end if;
  return 'true';
 elsif action in ('createaccomodation','updateaccomodation') then
  target:=nullif(payload->>'id','')::uuid;
  if action='updateaccomodation' then
   select * into stay from public.vetaccomodation where id=target and not deleted for update;
   if not found or stay."isLogOut" then raise exception 'Açık konaklama bulunamadı';end if;
  end if;
  select * into room from public.vetrooms where id=(payload->>'roomId')::uuid and not deleted for update;
  if not found then raise exception 'Oda bulunamadı';end if;
  perform private.require_access('clinical',true,room.branch_id);
  checkout:=coalesce(payload->>'checkOutDate',payload->>'checkoutDate')::timestamptz;
  if checkout is null or (payload->>'checkinDate')::timestamptz>=checkout then raise exception 'Giriş ve çıkış tarihleri geçersiz';end if;
  if exists(select 1 from public.vetaccomodation where "roomId"=room.id and id is distinct from target and not deleted and not "isLogOut" and "checkinDate"<checkout and "checkOutDate">(payload->>'checkinDate')::timestamptz) then raise exception 'Oda bu tarihlerde dolu';end if;
  return private.save_entity('vetaccomodation',payload||jsonb_build_object('branch_id',room.branch_id),case when action='createaccomodation' then 'create' else 'update' end);
 elsif action='updatecheckout' then
  select * into stay from public.vetaccomodation where id=(payload->>'accomodationId')::uuid and not deleted for update;
  if not found or stay."isLogOut" then raise exception 'Açık konaklama bulunamadı';end if;
  perform private.require_access('clinical',true,stay.branch_id);
  select * into room from public.vetrooms where id=stay."roomId" for update;
  checkout:=(payload->>'checkOutDate')::timestamptz;
  if checkout is null or checkout<=stay."checkinDate" then raise exception 'Çıkış tarihi girişten sonra olmalı';end if;
  due:=private.round_even(room.price*greatest(1,ceil(extract(epoch from checkout-stay."checkinDate")/case when room."pricingType"=2 then 3600 else 86400 end)));
  if due<=0 then raise exception 'Oda fiyatı pozitif olmalı';end if;
  sale:=private.create_sale(jsonb_build_object('customerId',stay."customerId",'branch_id',stay.branch_id,'type',1,'price',due,'isAccomodation',true,'accomodationId',stay.id,'date',checkout));
  if coalesce((payload->>'collectionAmount')::numeric,0)>0 then perform private.collect_sale(jsonb_build_object('saleBuyId',sale->>'id','amount',payload->'collectionAmount','paymentId',payload->'paymentId'));end if;
  record:=private.save_entity('vetaccomodationcheckouts',jsonb_build_object('accomodationId',stay.id,'branch_id',stay.branch_id,'checkinDate',stay."checkinDate",'checkOutDate',checkout,'saleBuyId',sale->>'id','accomodationAmount',due,'collectionAmount',payload->'collectionAmount','paymentId',payload->'paymentId'),'create');
  perform private.save_entity('vetaccomodation',jsonb_build_object('id',stay.id,'isLogOut',true,'checkOutDate',checkout,'accomodationcheckOutId',record->>'id'),'update');
  return 'true';
 elsif action='deleteaccomodation' then
  if exists(select 1 from public.vetsalebuyowner where "accomodationId"=(payload->>'id')::uuid and not deleted) then raise exception 'Önce konaklama satışını iptal edin';end if;
  return private.save_entity('vetaccomodation',payload,'delete');
 end if;
 return private.clinical_operation_base(action,payload);
end;$$;
revoke all on function private.check_patient_owner(),private.clinical_operation(text,jsonb) from public,authenticated;
