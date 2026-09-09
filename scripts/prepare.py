"""One-time extraction into this new repository. Never modifies BrewCloud."""
from pathlib import Path
import json,re,shutil
root=Path(__file__).resolve().parents[1]
assert root.name=='Odivon.Vet'
for relative in ['src/app/modules/gym','src/app/modules/appointment-management','src/app/modules/connecthub','src/app/core/services/gym','src/app/core/services/gympersonnel']:
    target=(root/relative).resolve()
    assert target.is_relative_to(root)
    if target.exists(): shutil.rmtree(target)
route=root/'src/app/app.routing.ts'
s=route.read_text(encoding='utf-8-sig')
start=s.index("            {\n                path: 'gymdashboards'") if "            {\n                path: 'gymdashboards'" in s else -1
if start>=0: s=s[:start]+"        ],\n    },\n];\n"
route.write_text(s,encoding='utf-8')
p=root/'package.json'; pkg=json.loads(p.read_text())
pkg['name']='odivon-vet';pkg['version']='0.1.0';pkg['description']='Odivon Vet';pkg['author']='Odivon'
pkg['scripts']={'ng':'ng','start':'ng serve','build':'ng build --configuration production','watch':'ng build --watch --configuration development','test':'node --test tests/*.test.mjs','test:ui':'ng test --watch=false --browsers=ChromeHeadless','db:test':'node --test tests/database.test.mjs','config':'node scripts/configure.mjs'}
d=pkg['dependencies']
for k in ['@angular-material-components/color-picker','@angular-material-components/datetime-picker','@angular-material-components/moment-adapter']: d[k]='15.0.0'
d['@angular/material-moment-adapter']='15.1.1';d['@supabase/supabase-js']='2.116.0';d['tinymce']='6.8.6'
for k in ['ng','add','mat-select-filter','devexpress-reporting-angular','@devexpress/analytics-core'] : d.pop(k,None)
pkg['devDependencies']['@electric-sql/pglite']='0.5.8'
pkg['devDependencies']['@types/node']='18.19.130'
p.write_text(json.dumps(pkg,indent=2)+'\n')
angular=root/'angular.json';config=json.loads(angular.read_text()); proj=config['projects']['fuse']; build=proj['architect']['build']['options'];build['outputPath']='dist/odivon-vet';config['cli']['analytics']=False;angular.write_text(json.dumps(config,indent=2)+'\n')
for f in (root/'src').rglob('*'):
    if f.suffix not in ['.ts','.html','.json','.scss']:continue
    s=f.read_text(encoding='utf-8-sig')
    s=s.replace("from 'mat-select-filter'", "from 'app/shared/select-filter.module'").replace('from "mat-select-filter"','from "app/shared/select-filter.module"')
    s=s.replace('BrewCloud','Odivon Vet').replace('Brew Cloud','Odivon Vet').replace('VetSystems','Odivon Vet')
    f.write_text(s,encoding='utf-8')
(root/'.gitignore').write_text('/node_modules\n/dist\n/.angular\n/coverage\n/.env*\n!/.env.example\n/supabase/**/.temp\n/src/assets/odivon-config.json\n*.log\n')
for env in ['environment.ts','environment.prod.ts']:
    (root/'src/environments'/env).write_text('export const environment = { production: '+str('prod' in env).lower()+", apiUrl: '', appName: 'Odivon Vet', env: '"+('production' if 'prod' in env else 'development')+"', IsApiConnect: true };\n")
print('Extracted Odivon Vet; Angular 15 retained.')
