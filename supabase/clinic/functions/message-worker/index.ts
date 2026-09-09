import {createClient} from 'npm:@supabase/supabase-js@2.116.0';
import {deliver,receipt} from './providers.mjs';
Deno.serve(async req=>{
 const token=Deno.env.get('WORKER_TOKEN');if(!token||req.method!=='POST'||req.headers.get('authorization')!=='Bearer '+token)return new Response('Unauthorized',{status:401});
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 const stored=await db.rpc('get_provider_configuration');if(stored.error)return Response.json({error:'Provider configuration unavailable'},{status:503});
 const config=stored.data;
 if(!['test','live'].includes(config.mode||''))return Response.json({error:'Provider mode must be configured'},{status:503});
 let job:any;
 try{
  const claim=await db.rpc('claim_message_job');if(claim.error)throw claim.error;job=claim.data;
  if(job){
   let result;try{result=await deliver(job,config);}catch{result={state:'unknown',safe_error:'Sağlayıcı gönderim sonucu doğrulanamadı. Tekrar göndermeden önce sağlayıcı panelini kontrol edin.'};}
   const update=await db.from('message_outbox').update({...result,updated_at:new Date().toISOString(),receipt_after:new Date(Date.now()+60000).toISOString()}).eq('id',job.id).eq('state','sending');if(update.error)throw update.error;
   return Response.json({id:job.id,state:result.state});
  }
  const pending=await db.rpc('claim_receipt_job');if(pending.error)throw pending.error;job=pending.data;
  if(job){const result=await receipt(job,config);const update=await db.from('message_outbox').update({...result,updated_at:new Date().toISOString()}).eq('id',job.id).eq('state','sent');if(update.error)throw update.error;return Response.json({id:job.id,state:result.state});}
  return Response.json({state:'idle'});
 }catch{return Response.json({error:'Message worker failed'},{status:503});}
});
