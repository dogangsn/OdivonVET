export class ManagementApi {
 constructor(token,fetcher=fetch){this.token=token;this.fetcher=fetcher;}
 async call(path,method='GET',body){
  const multipart=body instanceof FormData;
  const response=await this.fetcher('https://api.supabase.com/v1'+path,{method,headers:{Authorization:'Bearer '+this.token,...(body&&!multipart?{'Content-Type':'application/json'}:{})},body:body?(multipart?body:JSON.stringify(body)):undefined,signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw new Error('Management API returned HTTP '+response.status);
  const text=await response.text();return text?JSON.parse(text):null;
 }
 query(ref,query,parameters=[]){return this.call('/projects/'+ref+'/database/query','POST',{query,...(parameters.length?{parameters}:{})});}
}
