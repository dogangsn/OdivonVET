from pathlib import Path
p=Path(__file__).resolve().parents[1]/'supabase/clinic/migrations/202609090006_operations.sql'
s=p.read_text(encoding='utf-8')
a=s.index(" elsif action='createstocktracking' then");b=s.index(" elsif action in ('getuserslist'",a)
s=s[:a]+" elsif action in ('createstocktracking','updatestocktracking','deletestocktracking') then result:=private.stock_operation(action,p_payload);\n"+s[b:]
s=s.replace(" elsif action='deletecollection' then result:=private.save_entity('vetpaymentcollection',p_payload,'delete');", " elsif action in ('deletecollection','deletepaychart','updatesale','updatesalebuy','updatesalecollection','createbalancesalecollection','createcollection') then result:=private.commercial_operation(action,p_payload);")
s=s.replace("   return saved.result;", "   if op.entity is not null then select scope into sc from private.entity_registry where name=op.entity;perform private.require_access(sc,true,private.branch());end if;\n   return saved.result;")
p.write_text(s,encoding='utf-8')
