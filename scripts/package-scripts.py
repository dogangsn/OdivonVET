from pathlib import Path
import json
r=Path(__file__).resolve().parents[1];p=r/'package.json';data=json.loads(p.read_text(encoding='utf-8'))
data['scripts'].update({'config':'node --env-file-if-exists=.env scripts/configure.mjs','supabase:bundle':'node scripts/bundle-provisioning.mjs','supabase:prepare':'node scripts/bundle-provisioning.mjs && node scripts/prepare-local.mjs','supabase:seed':'node --env-file-if-exists=.env scripts/create-local-owner.mjs','check:edge':'deno check --config supabase/deno.json supabase/management/functions/clinic-provisioner/index.ts supabase/management/functions/clinic-directory/index.ts supabase/management/functions/clinic-maintenance/index.ts supabase/management/functions/clinic-activate/index.ts supabase/clinic/functions/message-worker/index.ts supabase/clinic/functions/clinic-members/index.ts'})
data['dependencies'].pop('@microsoft/signalr',None)
p.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
