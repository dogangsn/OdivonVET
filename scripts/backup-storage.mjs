import {createClient} from '@supabase/supabase-js';
import {backupStorage,restoreStorage} from './storage-archive.mjs';
const [mode,directory]=process.argv.slice(2);
if(!['backup','restore-local'].includes(mode)||!directory)throw new Error('Usage: node scripts/backup-storage.mjs backup|restore-local DIRECTORY');
const url=process.env.ODIVON_ARCHIVE_URL;const key=process.env.ODIVON_ARCHIVE_SERVICE_KEY;
if(!url||!key)throw new Error('Set ODIVON_ARCHIVE_URL and ODIVON_ARCHIVE_SERVICE_KEY in the operator environment');
if(mode==='restore-local'&&!['localhost','127.0.0.1','[::1]'].includes(new URL(url).hostname))throw new Error('Restore rehearsal only accepts a local destination');
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
if(mode==='backup'){const result=await backupStorage(client,directory);console.log('Archived '+result.files.length+' files; '+result.pending.length+' incomplete uploads recorded.');}
else console.log(await restoreStorage(client,directory));
