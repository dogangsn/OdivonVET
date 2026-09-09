import {createClient} from 'npm:@supabase/supabase-js@2.116.0';
import {clinicWorkerToken} from '../clinic-provisioner/token.mjs';
Deno.serve(async req=>{
 const token=Deno.env.get('WORKER_TOKEN');if(!token||req.method!=='POST'||req.headers.get('authorization')!=='Bearer '+token)return new Response('Unauthorized',{status:401});
 const master=Deno.env.get('CLINIC_WORKER_MASTER');if(!master)return new Response('Worker configuration required',{status:503});
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 const {data,error}=await db.from('clinic_applications').select('id,project_ref').eq('state','ready');if(error)return new Response('Directory unavailable',{status:503});
 const outcomes=await Promise.all(data.map(async c=>{try{const response=await fetch('https://'+c.project_ref+'.supabase.co/functions/v1/message-worker',{method:'POST',headers:{Authorization:'Bearer '+await clinicWorkerToken(master,c.project_ref),'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(45000)});return {id:c.id,ok:response.ok};}catch{return {id:c.id,ok:false};}}));
 return Response.json({outcomes},{status:outcomes.some(o=>!o.ok)?503:200});
});
