from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'docs/source-inventory.json').read_text())
sql=[];types=[]
def scope(name):
 if any(x in name for x in ['Sale','PaymentCollection','Casing']):return 'finance'
 if any(x in name for x in ['Product','Stock','Store','Supplier','Demand']):return 'inventory'
 if 'Customer' in name or 'Adress' in name or 'Farms' in name:return 'customers'
 if any(x in name for x in ['Appo','Agenda','ShortCut']):return 'appointments'
 if any(x in name for x in ['Document','Documents']):return 'files'
 if any(x in name for x in ['Patient','Examination','VaccineCalendar','Weight','Accomodation','Room']):return 'clinical'
 return 'definitions'
for name,e in data['entities'].items():
 table=e['table']; fields=e['fields']; fields.pop('id',None)
 # RecId / RecordId is generated; not a user-controlled ordering or identity.
 fields.pop('recId',None);fields.pop('recordId',None)
 props=['id uuid primary key default gen_random_uuid()', '"recId" bigint generated always as identity unique','branch_id uuid references public.branches(id) default private.branch()', '"createDate" timestamptz not null default now()', '"updateDate" timestamptz not null default now()', 'deleted boolean not null default false']
 for key,v in fields.items():
  if key in ['createDate','updateDate','deleted']:continue
  ty=v['sql'];default={'text':" default ''",'boolean':' default false','numeric':' default 0','integer':' default 0','bigint':' default 0'}.get(ty,'')
  props.append('"'+key+'" '+ty+default)
 # Preserve embedded address information while address records also remain relational.
 if name=='VetCustomers':props.append('adress jsonb not null default \'{}\'::jsonb')
 sql.append('create table public.'+table+' (\n '+',\n '.join(props)+'\n);')
 sc=scope(name)
 sql.append(f"alter table public.{table} enable row level security;\ncreate policy read_{table} on public.{table} for select to authenticated using(not deleted and private.allowed('{sc}',false,branch_id));\ngrant select on public.{table} to authenticated;\ngrant all on public.{table} to service_role;\ncreate trigger audit_{table} after insert or update or delete on public.{table} for each row execute function private.audit_change();\ncreate index on public.{table}(branch_id) where not deleted;")
 types.append('export interface '+name+' { id: string; recId: number; branch_id: string; '+ ' '.join(k+('?' if v['nullable'] else '')+': '+{'uuid':'string','text':'string','timestamptz':'string','bytea':'string','boolean':'boolean'}.get(v['sql'],'number')+';' for k,v in fields.items())+' }')
 e['scope']=sc
out=root/'supabase/clinic/migrations';out.mkdir(parents=True,exist_ok=True)
(out/'202609090002_entities.sql').write_text('\n\n'.join(sql),encoding='utf-8')
ts=root/'src/app/core/supabase';ts.mkdir(parents=True,exist_ok=True)
(ts/'entities.ts').write_text('// Generated from the source inventory; regenerate with scripts/schema.py.\n'+'\n'.join(types),encoding='utf-8')
(root/'docs/source-inventory.json').write_text(json.dumps(data,indent=2),encoding='utf-8')
print('Generated '+str(len(types))+' relational entity tables and TypeScript contracts.')
