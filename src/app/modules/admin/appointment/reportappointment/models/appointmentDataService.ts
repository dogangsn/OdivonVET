import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })

export class AppointmentDataService {
    getGithubIssues(thisWeekData: any, lastWeekData: any): any {
        return {
            githubIssues: {
                overview: {
                    'this-week': {
                        'new-issues': thisWeekData.newIssues,
                        'closed-issues': thisWeekData.closedIssues,
                        'fixed': thisWeekData.fixed,
                        'wont-fix': thisWeekData.wontFix,
                        're-opened': thisWeekData.reOpened,
                        'needs-triage': thisWeekData.needsTriage
                    },
                    'last-week': {
                        'new-issues': lastWeekData.newIssues,
                        'closed-issues': lastWeekData.closedIssues,
                        'fixed': lastWeekData.fixed,
                        'wont-fix': lastWeekData.wontFix,
                        're-opened': lastWeekData.reOpened,
                        'needs-triage': lastWeekData.needsTriage
                    }
                },
                labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
                series: {
                    'this-week': [
                        {
                            name: 'Randevu',
                            type: 'line',
                            data: thisWeekData.series.newIssues
                        },
                        {
                            name: 'Tamamlanan Randevu',
                            type: 'column',
                            data: thisWeekData.series.closedIssues
                        }
                    ],
                    'last-week': [
                        {
                            name: 'New issues',
                            type: 'line',
                            data: lastWeekData.series.newIssues
                        },
                        {
                            name: 'Closed issues',
                            type: 'column',
                            data: lastWeekData.series.closedIssues
                        }
                    ]
                }
            }
        };
    }
  }