from pathlib import Path
p=Path(__file__).resolve().parents[1]/'supabase/clinic/migrations/202609090006_operations.sql'
s=p.read_text(encoding='utf-8')
s=s.replace("('createcustomer','deletecustomer','createexamination','updateexamination')", "('createcustomer','deletecustomer','createexamination','updateexamination','deleteexamination','createpatient','updatepatient','updatecustomerbyid','updatepatientsweight','createaccomodation','updateaccomodation','deleteaccomodation','updatecheckout')")
p.write_text(s,encoding='utf-8')
