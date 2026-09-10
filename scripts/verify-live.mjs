const origin=(process.env.ODIVON_APP_ORIGIN||'https://vet.odivon.com').replace(/\/$/,'');
const projectRef=process.env.ODIVON_MANAGEMENT_PROJECT_REF||'bchqsyqimcudbybdovjx';
const configResponse=await fetch(origin+'/assets/odivon-config.json',{cache:'no-store'});
if(!configResponse.ok)throw new Error('Live public config is unavailable.');
const config=await configResponse.json();
if(new URL(config.management.url).hostname!==projectRef+'.supabase.co')throw new Error('Live config points to another Supabase project.');
const publishableKey=config.management.publishableKey;
if(!/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey)&&!publishableKey.startsWith('eyJ'))throw new Error('Live publishable key is invalid.');
const cache=configResponse.headers.get('cache-control')||'';
if(!/no-cache|no-store|max-age=0/.test(cache))throw new Error('Live public config may be cached.');
const headers={apikey:publishableKey};
const authResponse=await fetch(config.management.url+'/auth/v1/settings',{headers});const auth=await authResponse.json();
if(!authResponse.ok||auth.disable_signup||!auth.external?.email||!auth.mailer_autoconfirm)throw new Error('Management Auth is not ready for direct membership.');
const tableResponse=await fetch(config.management.url+'/rest/v1/clinic_applications?select=id&limit=0',{headers});
if(!tableResponse.ok)throw new Error('Management schema is unavailable: HTTP '+tableResponse.status);
const directoryResponse=await fetch(config.management.url+'/functions/v1/clinic-directory',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({email:'smoke-check@example.invalid'})});
if(directoryResponse.status===404){const body=await directoryResponse.text();if(body.includes('Requested function was not found'))throw new Error('clinic-directory is not deployed.');}
if(![400,404].includes(directoryResponse.status))throw new Error('clinic-directory returned unexpected HTTP '+directoryResponse.status);
console.log('Live Odivon Vet infrastructure checks passed:',origin);
