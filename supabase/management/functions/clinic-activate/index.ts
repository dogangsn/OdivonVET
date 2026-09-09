import {createClient} from 'npm:@supabase/supabase-js@2.116.0';
import {ManagementApi} from '../clinic-provisioner/management.mjs';
Deno.serve(async req=>{
 const token=Deno.env.get('ACTIVATION_TOKEN');if(!token||req.method!=='POST'||req.headers.get('authorization')!=='Bearer '+token)return new Response('Unauthorized',{status:401});
 try{
  const {id,reference}=await req.json();if(typeof reference!=='string'||reference.trim().length<3)return new Response('Payment reference required',{status:400});
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
  const clinic=await db.from('clinic_applications').select('project_ref').eq('id',id).eq('state','ready').single();if(clinic.error)throw clinic.error;
  const api=new ManagementApi(Deno.env.get('SUPABASE_MANAGEMENT_TOKEN')!);
  await api.query(clinic.data.project_ref,'select public.activate_paid($1)',[reference]);
  const audit=await db.rpc('record_paid_activation',{p_id:id,p_reference:reference});if(audit.error)throw audit.error;
  return Response.json({id,status:'paid'});
 }catch{return Response.json({error:'Activation could not be confirmed; retry with the same payment reference.'},{status:503});}
});
