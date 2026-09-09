from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'src/app/modules/admin/clinic-account/clinic-account.component.ts';s=p.read_text(encoding='utf-8')
s="import {ClinicFilesService} from 'app/core/supabase/clinic-files.service';\n"+s
s=s.replace('<p>Deneme süresi', '<button class="p-3 border ml-3" [disabled]="busy" (click)="loadFiles()">Dosyalarımı listele</button><ul><li class="my-3" *ngFor="let f of files"><button class="underline" [disabled]="busy" (click)="downloadFile(f)">{{f.name}}</button> ({{f.size}} bayt)</li></ul><p>Deneme süresi')
s=s.replace('settings:any;message=', 'files:any[]=[];settings:any;message=')
s=s.replace('constructor(private clinics:ClinicClientService){}','constructor(private clinics:ClinicClientService,private storage:ClinicFilesService){}')
s=s.replace("routerLink=\"/sign-out\"", "routerLink=\"/auth/sign-out\"")
idx=s.rindex('}')
s=s[:idx]+''' async loadFiles(){this.busy=true;try{const {data,error}=await(await this.clinics.client()).rpc('export_files');if(error)throw error;this.files=data;this.message='Dosya adlarına tıklayarak içeriklerini indirebilirsiniz.';}catch(e){this.message=e.message;}finally{this.busy=false;}}
 async downloadFile(file:any){this.busy=true;try{const blob=await this.storage.downloadPath(file.object_path);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=file.name;a.click();URL.revokeObjectURL(url);}catch(e){this.message=e.message;}finally{this.busy=false;}}
'''+s[idx:]
p.write_text(s,encoding='utf-8')
