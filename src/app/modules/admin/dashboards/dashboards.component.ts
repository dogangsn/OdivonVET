import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ProjectService } from './project.service';
import { Subject, takeUntil } from 'rxjs';
import { ApexOptions } from 'ng-apexcharts';
import { DashboardsDto } from './models/DashboardsDto';
import { DashboardService } from 'app/core/services/dashboards/dashboards.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AppointmentService } from 'app/core/services/appointment/appointment.service';
import { SweetAlertDto } from 'app/modules/bases/models/SweetAlertDto';
import { SweetalertType } from 'app/modules/bases/enums/sweetalerttype.enum';
import { GeneralService } from 'app/core/services/general/general.service';
import { TranslocoService } from '@ngneat/transloco';
import { LogViewComponent } from '../commonscreen/log-view/log-view.component';
import { MatDialog } from '@angular/material/dialog';
import { MessageSendComponent } from '../commonscreen/message-send/message-send.component';
import { SmsType } from '../definition/smstemplate/models/smsType.enum';
import { DailyAppointmentListDto } from '../appointment/dailyappointment/models/dailyappointmentlistdto';

@Component({
    selector: 'dashboards',
    templateUrl: './dashboards.component.html',
    styleUrls: ['./dashboards.component.scss'],
    //encapsulation: ViewEncapsulation.None,
})
export class DashboardsComponent implements OnInit, OnDestroy {

    loader = true;

    displayedColumns: string[] = [
        'date',
        'customerPatientName',
        'services',
        'statusName',
        'actions'
    ];
    @ViewChild('paginator') paginator: MatPaginator;


    _list: DailyAppointmentListDto[] = [];;
    _listpast: DailyAppointmentListDto[] = [];;
    upcomingdataSource = new MatTableDataSource<any>(this._list);
    pastdataSource = new MatTableDataSource<any>(this._listpast)

    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};
    data: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    dashboards: DashboardsDto;


    constructor(
        private _projectService: ProjectService,
        private _dashboardService: DashboardService,
        private _appointmentService: AppointmentService,
        private _translocoService: TranslocoService,
        private _dialog: MatDialog,
    ) { }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this.getDashboards();
    }

    getDashboards() {
        debugger;
        this._dashboardService.getdashboardsList().subscribe((response) => {
            this.dashboards = response.data;

            this._list = this.dashboards.upcomingAppointment;
            this.upcomingdataSource = new MatTableDataSource<any>(
                this._list
            );
            this.upcomingdataSource.paginator = this.paginator;

            this._listpast = this.dashboards.pastAppointment;
            this.pastdataSource = new MatTableDataSource<any>(
                this._listpast
            )
            this.pastdataSource.paginator = this.paginator;

            this.loader = false;
        });
    }


    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    getStatusClass(status: number): string {
        switch (status) {
            case 1:
                return 'status-1';
            case 2:
            case 4:
                return 'status-2';
            case 3:
                return 'status-3';
            default:
                return '';
        }
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
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            colors: ['#64748B', '#94A3B8'],
            dataLabels: {
                enabled: true,
                enabledOnSeries: [0],
                background: {
                    borderWidth: 0,
                },
            },
            grid: {
                borderColor: 'var(--fuse-border)',
            },
            labels: this.data.githubIssues.labels,
            legend: {
                show: false,
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%',
                },
            },
            series: this.data.githubIssues.series,
            states: {
                hover: {
                    filter: {
                        type: 'darken',
                        value: 0.75,
                    },
                },
            },
            stroke: {
                width: [3, 0],
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
            },
            xaxis: {
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    color: 'var(--fuse-border)',
                },
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
                tooltip: {
                    enabled: false,
                },
            },
            yaxis: {
                labels: {
                    offsetX: -16,
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
            },
        };

        // Task distribution
        this.chartTaskDistribution = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'polarArea',
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            labels: this.data.taskDistribution.labels,
            legend: {
                position: 'bottom',
            },
            plotOptions: {
                polarArea: {
                    spokes: {
                        connectorColors: 'var(--fuse-border)',
                    },
                    rings: {
                        strokeColor: 'var(--fuse-border)',
                    },
                },
            },
            series: this.data.taskDistribution.series,
            states: {
                hover: {
                    filter: {
                        type: 'darken',
                        value: 0.75,
                    },
                },
            },
            stroke: {
                width: 2,
            },
            theme: {
                monochrome: {
                    enabled: true,
                    color: '#93C5FD',
                    shadeIntensity: 0.75,
                    shadeTo: 'dark',
                },
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
            },
            yaxis: {
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
            },
        };

        // Budget distribution
        this.chartBudgetDistribution = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'radar',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#818CF8'],
            dataLabels: {
                enabled: true,
                formatter: (val: number): string | number => `${val}%`,
                textAnchor: 'start',
                style: {
                    fontSize: '13px',
                    fontWeight: 500,
                },
                background: {
                    borderWidth: 0,
                    padding: 4,
                },
                offsetY: -15,
            },
            markers: {
                strokeColors: '#818CF8',
                strokeWidth: 4,
            },
            plotOptions: {
                radar: {
                    polygons: {
                        strokeColors: 'var(--fuse-border)',
                        connectorColors: 'var(--fuse-border)',
                    },
                },
            },
            series: this.data.budgetDistribution.series,
            stroke: {
                width: 2,
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: (val: number): string => `${val}%`,
                },
            },
            xaxis: {
                labels: {
                    show: true,
                    style: {
                        fontSize: '12px',
                        fontWeight: '500',
                    },
                },
                categories: this.data.budgetDistribution.categories,
            },
            yaxis: {
                max: (max: number): number =>
                    parseInt((max + 10).toFixed(0), 10),
                tickAmount: 7,
            },
        };

        // Weekly expenses
        this.chartWeeklyExpenses = {
            chart: {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#22D3EE'],
            series: this.data.weeklyExpenses.series,
            stroke: {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis: {
                type: 'category',
                categories: this.data.weeklyExpenses.labels,
            },
            yaxis: {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };

        // Monthly expenses
        this.chartMonthlyExpenses = {
            chart: {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#4ADE80'],
            series: this.data.monthlyExpenses.series,
            stroke: {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis: {
                type: 'category',
                categories: this.data.monthlyExpenses.labels,
            },
            yaxis: {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };

        // Yearly expenses
        this.chartYearlyExpenses = {
            chart: {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#FB7185'],
            series: this.data.yearlyExpenses.series,
            stroke: {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis: {
                type: 'category',
                categories: this.data.yearlyExpenses.labels,
            },
            yaxis: {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };
    }

    translate(key: string): any {
        return this._translocoService.translate(key);
    }

    public redirectStatusUpdate = (id: string, status: number) => {
        const model = {
            id: id,
            status: status
        };
        this._appointmentService
            .updateAppointmentStatus(model)
            .subscribe((response) => {
                if (response.isSuccessful) {
                    this.getDashboards();
                    const sweetAlertDto2 = new SweetAlertDto(
                        this.translate('sweetalert.success'),
                        this.translate('sweetalert.transactionSuccessful'),
                        SweetalertType.success
                    );
                    GeneralService.sweetAlert(sweetAlertDto2);
                } else {
                    console.error('Silme işlemi başarısız.');
                }
            });
    }


    public logView = (id: string) => {
        const dialogRef = this._dialog.open(
            LogViewComponent,
            {
                maxWidth: '100vw !important',
                disableClose: true,
                data: { masterId: id },
            }
        );
    }

    formatDate(date: string): string {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        };
        return new Date(date).toLocaleString('tr-TR', options);
    }

    public upcomingsendMessage = (id: string) => {

       
    
        const selectedAppointment = this._list.find((item) => item.id == id);
        if (selectedAppointment) {
    
          let customerName =  selectedAppointment.customerPatientName;
          let appointmentDate = this.formatDate(selectedAppointment.date.toString()); 
          
          const model = {
            messageType: SmsType.AppointmentReminder,
            isFixMessage: true,
            customerId : selectedAppointment.customerId,
            customername: customerName,
            date : appointmentDate
          };
          const dialog = this._dialog
            .open(MessageSendComponent, {
              minWidth: '1000px',
              disableClose: true,
              data: model,
            })
            .afterClosed()
            .subscribe((response) => {
              if (response.status) {
                // this.getApponitmentList();
              }
            });
        }
    
    
      }

}
