export function xml(value){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');}
export function smsXml(job,c){return `<?xml version="1.0" encoding="UTF-8"?><smspack ka="${xml(c.user)}" pwd="${xml(c.password)}" org="${xml(c.sender)}"><mesaj><metin>${xml(job.body)}</metin><nums>${xml(job.recipient)},</nums></mesaj></smspack>`;}
export function parseSend(text){const match=/^\$(\d+)(?:#[\d.]+)?$/.exec(text.trim());return match?{state:'sent',provider_id:match[1]}:{state:'failed',safe_error:'Sağlayıcı gönderimi reddetti.'};}
export function parseReceipt(text,recipient){const digits=v=>v.replace(/\D/g,'').replace(/^0/,'90');const line=text.trim().split(/\r?\n/).map(l=>l.trim().split(/\s+/)).find(parts=>digits(parts[0])===digits(recipient));if(!line)return {state:'sent'};const code=Number(line[1]);if(code===3)return {state:'delivered'};if([5,6,7,12,13,15,16,17,18,19,20,21,22].includes(code))return {state:'failed',safe_error:'SMS teslim edilemedi ('+code+').'};return {state:'sent'};}
export async function deliver(job,config,fetcher=fetch){
 if(job.delivery_mode==='test')return {state:'delivered',provider_id:'test-'+job.id};
 if(job.delivery_mode==='live'&&config.mode!=='live')return {state:'failed',safe_error:'Canlı gönderim kapatılmış. İçeriği inceleyip yeni gönderim oluşturun.'};
 if(config.mode==='test')return {state:'delivered',provider_id:'test-'+job.id};
 if(config.mode!=='live')throw new Error('Provider mode must be test or live');
 if(job.channel==='sms'){
  if(!config.sms?.user||!config.sms?.password||!config.sms?.sender)throw new Error('SMS provider not configured');
  const response=await fetcher('https://smsgw.mutlucell.com/smsgw-ws/sndblkex',{method:'POST',headers:{'Content-Type':'text/xml; charset=UTF-8'},body:smsXml(job,config.sms),signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error('SMS delivery result uncertain');return parseSend(await response.text());
 }
 if(!config.email?.key||!config.email?.from)throw new Error('Email provider not configured');
 const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+config.email.key,'Content-Type':'application/json','Idempotency-Key':job.id},body:JSON.stringify({from:config.email.from,to:[job.recipient],subject:job.subject,text:job.body}),signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error('Email delivery result uncertain');const result=await response.json();if(!result.id)throw new Error('Email provider response invalid');return {state:'sent',provider_id:result.id};
}
export async function receipt(job,config,fetcher=fetch){
 if(job.channel!=='sms')return {state:'sent'};
 const response=await fetcher('https://smsgw.mutlucell.com/smsgw-ws/gtblkrprtex',{method:'POST',headers:{'Content-Type':'text/xml; charset=UTF-8'},body:`<?xml version="1.0" encoding="UTF-8"?><smsrapor ka="${xml(config.sms.user)}" pwd="${xml(config.sms.password)}" id="${xml(job.provider_id)}"/>`,signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error('Receipt unavailable');return parseReceipt(await response.text(),job.recipient);
}
