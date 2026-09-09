import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { ReportService } from 'app/core/services/reports/report.service';
import { AppointmentDashboardDto } from './models/appointmentDashboardDto';
import { ProjectService } from '../../dashboards/project.service';
import { Observable, Subject, takeUntil, zip } from 'rxjs';
import { Router } from '@angular/router';

import { AppointmentDataService } from './models/appointmentDataService';


export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-reportappointment',
  templateUrl: './reportappointment.component.html',
  styleUrls: ['./reportappointment.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {
      provide: MAT_DATE_FORMATS, useValue: MY_FORMATS
    },
  ],
})
export class ReportappointmentComponent implements OnInit, OnDestroy {

  chartGithubIssues: ApexOptions = {};
  data: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  loader = true;error='';

  dashboards: AppointmentDashboardDto;
  destroy$: Subject<boolean> = new Subject<boolean>();


  constructor(
    private _reportService: ReportService,
    private cdr: ChangeDetectorRef,
    private _projectService: AppointmentDataService,
    private _router: Router
  ) {

  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
    this.destroy$.next(true);this.destroy$.complete();
  }

  ngOnInit() {



    zip(
      this.getDashboards()
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (value) => {
        this.setDashboard(value[0])
      },
      error: (e) => {
        this.error='Randevu raporu yüklenemedi: '+e.message;this.loader=false;this.cdr.markForCheck();
      },
      complete: () => {

        this.loader = false
        this.data = this.createProjectData();
        this._prepareChartData();this.cdr.markForCheck();

      }
    });

  }

  getDashboards(): Observable<any> {
    return this._reportService.getAppointmentDashboard();
  }

  setDashboard(response: any): void {
    this.dashboards = response.data;
    console.log(this.dashboards);
  }

  private _prepareChartData(): void {
    // Github issues
    this.chartGithubIssues = {
      chart: {
        fontFamily: 'inherit',
        foreColor: 'inherit',
        height: '100%',
        type: 'line',
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      colors: ['#64748B', '#94A3B8'],
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0],
        background: {
          borderWidth: 0
        }
      },
      grid: {
        borderColor: 'var(--fuse-border)'
      },
      labels: this.data.githubIssues.labels,
      legend: {
        show: false
      },
      plotOptions: {
        bar: {
          columnWidth: '50%'
        }
      },
      series: this.data.githubIssues.series,
      states: {
        hover: {
          filter: {
            type: 'darken',
            value: 0.75
          }
        }
      },
      stroke: {
        width: [3, 0]
      },
      tooltip: {
        followCursor: true,
        theme: 'dark'
      },
      xaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          color: 'var(--fuse-border)'
        },
        labels: {
          style: {
            colors: 'var(--fuse-text-secondary)'
          }
        },
        tooltip: {
          enabled: false
        }
      },
      yaxis: {
        labels: {
          offsetX: -16,
          style: {
            colors: 'var(--fuse-text-secondary)'
          }
        }
      }
    };

  }

  createProjectData() {
    return {githubIssues:{labels:['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],series:{'this-week':[
      {name:'Randevu',type:'line',data:this.dashboards.monthlyAppointmentCounts},
      {name:'Tamamlanan Randevu',type:'column',data:this.dashboards.monthlyAppointmentCompletedCounts}
    ]}}};
  }
}
