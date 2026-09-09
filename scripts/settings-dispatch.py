from pathlib import Path
p=Path(__file__).resolve().parents[1]/'supabase/clinic/migrations/202609090006_operations.sql';s=p.read_text(encoding='utf-8')
a=s.index(" elsif action='getcompany' then");b=s.index(" elsif action='getbranchlist' then",a)
s=s[:a]+" elsif action in ('getcompany','updatecompany','gettitledefination','createtitledefination','updatetitledefination','deletetiledefination') then result:=private.settings_operation(action,p_payload);\n"+s[b:]
s=s.replace("values(p_payload->>'name')","values(p_payload->>'name')")
s=s.replace("select coalesce(jsonb_agg(jsonb_build_object('id',id,'firstName',name,'lastName','','name',name,'email',email,'role',role)),'[]') into result from public.profiles where active and (private.is_owner() or branch_id=private.branch());", "if action='getactiveuser' then select jsonb_build_object('id',id,'firstName',name,'lastName','','name',name,'email',email,'role',role) into result from public.profiles where id=auth.uid() and active;else select coalesce(jsonb_agg(jsonb_build_object('id',id,'firstName',name,'lastName','','name',name,'email',email,'role',role)),'[]') into result from public.profiles where active and (private.is_owner() or branch_id=private.branch());end if;")
p.write_text(s,encoding='utf-8')
