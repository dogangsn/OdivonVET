export async function clinicWorkerToken(master,projectRef){
 const data=new TextEncoder().encode(projectRef);
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(master),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signature=await crypto.subtle.sign('HMAC',key,data);
 return Array.from(new Uint8Array(signature),value=>value.toString(16).padStart(2,'0')).join('');
}
