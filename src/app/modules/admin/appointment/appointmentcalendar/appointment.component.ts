import { Component, OnInit, ViewEncapsulation, Injectable, ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { from, Observable, Subject, takeUntil, zip } from 'rxjs';
import {
    CalendarEvent,
    CalendarEventTimesChangedEvent,
    CalendarView,
} from 'angular-calendar';
import {
    addDays,
    addHours,
    isSameDay,
    setDay,
    startOfDay,
    subDays,
    subSeconds,
} from 'date-fns';
import { AddApponitnmentDialogComponent } from './add-apponitnment-dialog/add-apponitnment-dialog.component';
import { TranslocoService } from '@ngneat/transloco';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from 'app/core/services/appointment/appointment.service';

import { AppSignalRService } from 'app/core/services/signalR/appSignalRService.service';
import { UserService } from 'app/core/user/user.service';
import { UsersService } from 'app/core/services/settings/users/users.service';

@Component({
    selector: 'app-appointment',
    templateUrl: './appointment.component.html',
    styleUrls: ['./appointment.component.css'],
})
export class AppointmentComponent implements OnInit {
    appointmentsData: Appointment[];
    currentDate: Date = new Date();
    loader = true;


    receivedMessage: string;
    userId: string;
    users: any;
    action: any;
    appointmentCalendarAct:any
    destroy$: Subject<boolean> = new Subject<boolean>();
    resourcesData: any[] = [];

    constructor(
        private _dialog: MatDialog,
        private _translocoService: TranslocoService,
        private router: Router,
        private route: ActivatedRoute,
        private _appointmentService: AppointmentService,
        private signalRService: AppSignalRService,
        private _usersService: UsersService,
        private cdr: ChangeDetectorRef
    ) {
        const actions = localStorage.getItem('actions');
        if (actions) {
            this.action = JSON.parse(actions);
        }

        const appointmentAct = this.action.find((item: any) => {
            return item.roleSettingDetails.some((detail: any) => detail.target === 'appointmentcalendar');
        });
    
        if (appointmentAct) {
            this.appointmentCalendarAct = appointmentAct.roleSettingDetails.find((detail: any) => detail.target === 'appointmentcalendar');
        } else {
            this.appointmentCalendarAct = null;
        }
        
        console.log(this.appointmentCalendarAct);
        //this.appointmentsData = appointments;
    }

    ngOnInit(): void {

        this.getApponitmentList();
        this.getUserInfo();

        zip(
            this.getUserInfo()

        ).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (value) => {
                this.setUser(value[0])
            },
            error: (e) => {
                console.log(e);
            },
            complete: () => {

            }
        });

        // this._userService.user$.subscribe((user) => {
        //     this.userId = user.id;
        // });

        this.signalRService.startConnection().pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.signalRService.receiveMessage().pipe(takeUntil(this.destroy$)).subscribe((message) => {
              this.receivedMessage = message; this.getApponitmentList();
            });
          });

    }


    getUserInfo(): Observable<any> {
        return this._usersService.getActiveUser();
    }

    setUser(response: any): void {
        if (response.data) {
            this.users = response.data;
            this.userId = response.data.id;
        }
    }


    getApponitmentList() {
        const model = {
            appointmentType: 0
        }
        // const colors = ['#FF5733',  '#3357FF', '#FF33A1', '#A133FF'];
        this._appointmentService.getAppointmentslist(model).subscribe((response) => {
             
            const uniqueColors = Array.from(new Set(response.data.map((appointment) => appointment.colors)));
            this.resourcesData = uniqueColors.map((color, index) => ({
                id: index + 1,
                color: color
            }));
 
            const colorIdMap = this.resourcesData.reduce((acc, resource) => {
                acc[resource.color] = resource.id;
                return acc;
            }, {} as Record<string, number>);
 
            this.appointmentsData = response.data.map((appointment) => {
                const colorId = colorIdMap[appointment.colors] || 1;  
                return {
                    ...appointment,
                    colorId: colorId,
                    colors: appointment.colors 
                };
            });

            console.log(this.appointmentsData);
            console.log(this.resourcesData);

            this.loader = false;
        });
    }

    getRandomColor(): string {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    addPanelOpen(): void {

        const model = {
            visibleCustomer: true,
            selectedAppointment: null
        };


        const dialog = this._dialog
            .open(AddApponitnmentDialogComponent, {
                // maxWidth: '800vw !important',
                minWidth: '1000px',
                disableClose: true,
                data: model,
            })
            .afterClosed()
            .subscribe((response) => {
                if (response.status) {
                    this.getApponitmentList();
                }
            });
    }

    day(event: CalendarEvent, title: string): string {
        return event.title;
    }

    onAppointmentDeleted(e) {
        //this.showToast('Deleted', e.appointmentData.text, 'warning');
        console.log(e.appointmentsData.text)
    }

    ngOnDestroy():void {this.destroy$.next(true);this.destroy$.complete();}
    sendMessage(message:string):void {this.signalRService.sendMessage(message);}
}

export class Appointment {
    id: string;
    text: string;
    startDate: Date;
    endDate: Date;
    allDay?: boolean;
    colors: string;
    colorId?: number;
}
