from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'src/app/core/navigation/navigation.service.ts';s=p.read_text(encoding='utf-8');s="import {ClinicClientService} from 'app/core/supabase/clinic-client.service';import {screenScopes} from 'app/core/supabase/permissions';\n"+s
s=s.replace(' private state=', ' constructor(private clinics:ClinicClientService){}\n private state=')
s=s.replace(' as any;const value=', " as any;const visible=items.filter(item=>['dashboards','clinic-account'].includes(item.id)||this.clinics.permissions.some(p=>p.scope===screenScopes[item.id]&&p.read));const value=")
s=s.replace('default:items,compact:items,futuristic:items,horizontal:items','default:visible,compact:visible,futuristic:visible,horizontal:visible');p.write_text(s,encoding='utf-8')
for f,target in [('customer/customerlist/customerlist.component.ts','customerlist'),('retail/sales/sales.component.ts','sales'),('retail/buying/buying.component.ts','buying'),('cashing/cashtransactions/cashtransactions.component.ts','cashtransactions')]:
 p=r/'src/app/modules/admin'/f;s=p.read_text(encoding='utf-8').replace("detail.target === 'vaccineappointment'",f"detail.target === '{target}'");p.write_text(s,encoding='utf-8')
