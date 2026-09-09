create function public.lab_details(p_patient uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare patient public.vetpatients;customer public.vetcustomers;result jsonb;
begin
 select * into patient from public.vetpatients where id=p_patient and not deleted;
 if not found then raise exception 'Hasta bulunamadı';end if;
 perform private.require_access('files',false,patient.branch_id);
 perform private.require_access('clinical',false,patient.branch_id);
 select * into customer from public.vetcustomers where id=patient."customerId" and not deleted and private.allowed('customers',false,branch_id);
 result:=private.entity_json('vetpatients',to_jsonb(patient));
 return jsonb_build_object('id',patient.id,'customerId',customer.id,'customerName',concat_ws(' ',customer."firstName",customer."lastName"),'customerPhone',customer."phoneNumber",'customerEmail',customer."eMail",'patientName',patient.name,'patientType',result->>'animalTypeName','patientBreed',result->>'breedType','labDocuments',
 (select coalesce(jsonb_agg(jsonb_build_object('documentId',id,'documentName',name,'documentDate',created_at,'documentType',mime,'documentStatus',state) order by created_at desc),'[]') from public.clinic_files where patient_id=p_patient and kind='lab' and state='ready' and private.allowed('files',false,branch_id)));
end;$$;
revoke all on function public.lab_details(uuid) from public;grant execute on function public.lab_details(uuid) to authenticated;

-- Translate request DTO names once at the compatibility boundary.
alter function private.normalize_payload(text,jsonb) rename to normalize_payload_base;
create function private.normalize_payload(entity text,payload jsonb) returns jsonb language sql stable set search_path='' as $$
 select private.normalize_payload_base(entity,
 case when entity='vetsmstemplate' then payload||jsonb_strip_nulls(jsonb_build_object('name',payload->'templateName','content',payload->'templateContent')) else payload end);
$$;
revoke all on function private.normalize_payload(text,jsonb) from public,authenticated;
