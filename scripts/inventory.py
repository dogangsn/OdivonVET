from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
backend=root.parent/'BrewCloud'
domain=backend/'Services/Vet/BrewCloud.Vet.Domain/BrewCloud.Vet.Domain/Entities'
application=backend/'Services/Vet/BrewCloud.Vet.Application/BrewCloud.Vet.Application'
def clean(s): return re.sub(r'//[^\n]*|/\*.*?\*/','',s,flags=re.S)
entities={}
primitive={'Guid':'uuid','string':'text','int':'integer','long':'bigint','decimal':'numeric','double':'numeric','float':'numeric','bool':'boolean','DateTime':'timestamptz','byte':'integer','byte[]':'bytea'}
for f in sorted(domain.glob('*.cs')):
 s=clean(f.read_text(encoding='utf-8-sig')); fields={}
 for ty,name in re.findall(r'public\s+([\w?\[\]]+)\s+(\w+)\s*\{\s*get;\s*set;\s*\}',s):
  if ty.rstrip('?') in primitive:fields[name[0].lower()+name[1:]]={'sql':primitive[ty.rstrip('?')],'nullable':ty.endswith('?'),'source':name}
 entities[f.stem]={'table':f.stem.lower(),'fields':fields,'source':str(f.relative_to(backend))}
operations=[]
for folder in ['Services/Vet','Services/Account','Services/Mail','Services/Integrations']:
 for f in sorted((backend/folder).rglob('*.cs')):
  if not ('Commands' in f.parts or 'Queries' in f.parts) or 'obj' in f.parts:continue
  s=clean(f.read_text(encoding='utf-8-sig'))
  repos=list(dict.fromkeys(re.findall(r'IRepository<(?:[\w.]+\.)?(\w+)>',s)))
  req=re.search(r'class\s+(\w+)\s*:\s*IRequest<',s)
  if not req:continue
  head=s[req.end():s.find('public class',req.end()) if s.find('public class',req.end())>=0 else len(s)]
  props=[{'type':t,'name':n[0].lower()+n[1:]} for t,n in re.findall(r'public\s+([\w?<>.\[\]]+)\s+(\w+)\s*\{\s*get;\s*set;',head)]
  operations.append({'name':req.group(1),'source':str(f.relative_to(backend)),'entities':repos,'parameters':props})
(root/'docs').mkdir(exist_ok=True)
(root/'docs/source-inventory.json').write_text(json.dumps({'entities':entities,'operations':operations},indent=2),encoding='utf-8')
print(f'{len(entities)} entities, {len(operations)} request handlers inventoried')
for o in operations:
 if o['source'].startswith('Services\\Vet'):print(o['name']+': '+','.join(o['entities']))
