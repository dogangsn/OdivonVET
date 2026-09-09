from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'src/app/modules/admin/appointment/appointmentcalendar/appointment.component.ts';s=p.read_text(encoding='utf-8')
s=s.replace("import * as signalR from '@microsoft/signalr';",'').replace('    hubConnection: signalR.HubConnection;','').replace('                this.hubCreateConnection();','')
a=s.index('    startConnection = () => {');b=s.index('\nexport class Appointment {',a)
s=s[:a]+'''    ngOnDestroy():void {this.destroy$.next(true);this.destroy$.complete();}
    sendMessage(message:string):void {this.signalRService.sendMessage(message);}
}
''' +s[b:]
s=s.replace('this.signalRService.startConnection().subscribe','this.signalRService.startConnection().pipe(takeUntil(this.destroy$)).subscribe').replace('this.signalRService.receiveMessage().subscribe','this.signalRService.receiveMessage().pipe(takeUntil(this.destroy$)).subscribe').replace('this.receivedMessage = message;','this.receivedMessage = message; this.getApponitmentList();')
p.write_text(s,encoding='utf-8')
