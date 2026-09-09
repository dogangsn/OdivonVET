export class ManagementApi {
 constructor(token,fetcher=fetch){this.token=token;this.fetcher=fetcher;}
 async call(path,method='GET',body){
  const multipart=body instanceof FormData;
  const response=await this.fetcher('https://api.supabase.com/v1'+path,{method,headers:{Authorization:'Bearer '+this.token,...(body&&!multipart?{'Content-Type':'application/json'}:{})},body:body?(multipart?body:JSON.stringify(body)):undefined,signal:AbortSignal.timeout(45000)});
  // API responses can contain secrets; never reflect them to a browser or log them.
  if(!response.ok)throw new Error('Management API returned HTTP '+response.status);
  const text=await response.text();return text?JSON.parse(text):null;
 }
 query(ref,query,parameters=[]){return this.call('/projects/'+ref+'/database/query','POST',{query,...(parameters.length?{parameters}:{})});}
}
export function migrationQuery(migration){
 const quote=value=>"'"+value.replaceAll("'","''")+"'";
 return `begin;select pg_advisory_xact_lock(9060902);
 create schema if not exists private;
 create table if not exists private.odivon_migrations(version text primary key,checksum text not null,applied_at timestamptz not null default now());
 do $migration$ begin
 if exists(select 1 from private.odivon_migrations where version=${quote(migration.version)} and checksum<>${quote(migration.checksum)}) then raise exception 'Migration checksum mismatch';end if;
 if not exists(select 1 from private.odivon_migrations where version=${quote(migration.version)}) then
 execute ${quote(migration.sql)};
 insert into private.odivon_migrations(version,checksum) values(${quote(migration.version)},${quote(migration.checksum)});
 end if;end $migration$;commit;`;
}
