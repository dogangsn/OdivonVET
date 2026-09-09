/** Deterministic, resumable provisioning. Project creation is attempted only from queued. */
export async function advance(job,io){
 const name='odivon-'+job.id;
 if(job.state==='queued'){
  // Persist intent before any non-idempotent external call. An uncertain result is reconciled by name.
  await io.markCreating(job);
  const project=await io.createProject(name);
  return {state:'waiting',project_ref:project.id};
 }
 if(job.state==='creating'){
  const matches=(await io.listProjects()).filter(p=>p.name===name);
  if(matches.length===1)return {state:'waiting',project_ref:matches[0].id};
  if(matches.length>1||job.attempts>10)return {state:'attention',safe_error:'Proje oluşturma sonucu yönetici tarafından kontrol edilmeli.'};
  return {state:'creating'};
 }
 if(job.state==='waiting')return (await io.healthy(job.project_ref))?{state:'schema'}:{state:'waiting'};
 if(job.state==='schema')return await io.migrate(job);
 if(job.state==='functions')return await io.deploy(job);
 if(job.state==='owner')return await io.owner(job);
 throw new Error('Unknown provisioning state');
}
