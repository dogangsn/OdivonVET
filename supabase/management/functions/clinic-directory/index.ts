import {createClient} from 'npm:@supabase/supabase-js@2.116.0';
const headers={'Access-Control-Allow-Origin':Deno.env.get('APP_ORIGIN')||'http://localhost:4200','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json'};
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return new Response('{}',{status:405,headers});
 try{
  const {code}=await req.json();if(typeof code!=='string'||!/^[a-z0-9][a-z0-9-]{2,47}$/.test(code))throw new Error('Invalid clinic code');
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
  const {data,error}=await db.from('clinic_applications').select('code,public_url,publishable_key').eq('code',code).eq('state','ready').maybeSingle();
  if(error||!data)return new Response(JSON.stringify({error:'Klinik bulunamadı'}),{status:404,headers});
  return new Response(JSON.stringify({code:data.code,url:data.public_url,publishableKey:data.publishable_key}),{headers});
 }catch{return new Response(JSON.stringify({error:'Geçersiz istek'}),{status:400,headers});}
});
