import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
// Replace with your confirmation dialog component path
import { CreatevaccineComponent } from 'app/modules/admin/patient/createvaccine/createvaccine/createvaccine.component';
import { ConfirmDialogComponent } from 'app/modules/admin/patient/createvaccine/dialogs/ConfirmDialog/ConfirmDialog.component';

@Injectable({ providedIn: 'root' })
export class CreateVaccineGuard implements CanDeactivate<CreatevaccineComponent> {
  constructor(private dialog: MatDialog) {}

  destroy$: Subject<boolean> = new Subject<boolean>();

  canDeactivate(component: CreatevaccineComponent): Observable<boolean> | boolean {
    if (component.dataSource.data.some(vaccine => vaccine.isAdd)) {
      // Check if any vaccine is marked for addition
      return this.dialog
        .open(ConfirmDialogComponent, {
          data: {
            title: 'Are you sure you want to leave?',
            message: 'You have unsaved changes. Leaving now will discard them.',
          },
        })
        .afterClosed()
        .pipe(takeUntil(this.destroy$));
    }
    return true; // Allow navigation if no unsaved changes
  }
}
