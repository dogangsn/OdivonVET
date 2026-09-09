from pathlib import Path
r=Path(__file__).resolve().parents[1]/'supabase/clinic/migrations'
p=r/'202609090006_operations.sql';s=p.read_text(encoding='utf-8')
s=s.replace("result:=private.read_entity(op.entity,p_payload)","result:=private.read_operation(action,op.entity,p_payload)")
p.write_text(s,encoding='utf-8')
p=r/'202609090004_data.sql';s=p.read_text(encoding='utf-8')
s=s.replace("'branch_id','recId')", "'branch_id','recId','vaccineId','patientsId','sourceId','saleBuyId','appointmentType','isCompleted','isDone','productTypeId')")
p.write_text(s,encoding='utf-8')
