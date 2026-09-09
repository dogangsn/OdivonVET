import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FileManagerService } from 'app/core/services/file-manager/file-manager.service';
import { Items, Item } from '../models/file-manager.types';
import { FileUploadDialogComponent } from '../file-upload-dialog/file-upload-dialog.component';
import { RefreshService } from '../services/RefreshService';


@Component({
  selector: 'file-manager-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileManagerListComponent implements OnInit {



  drawerMode: 'side' | 'over';
  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  selectedFile: File | null = null;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  items: Items;
  selectedItem: Item;

  files: any[] = [];

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _dialog: MatDialog,
    private _fileManagerService: FileManagerService,
    private refreshService: RefreshService
  ) { }

  ngOnInit() {
    this.getDocuments();

    this.refreshService.refreshList$.subscribe(() => {
      this.getDocuments();
    });
  }

  getDocuments() {
    this._fileManagerService.getFileManagerList().subscribe((response) => {
      this.items = response.data;

      this._changeDetectorRef.markForCheck();
    });
  }


  onBackdropClicked(): void {
    this._router.navigate(['./'], { relativeTo: this._activatedRoute });
    this._changeDetectorRef.markForCheck();
  }

  openFileUpload() {
    // const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    // fileInput.click();
    const dialog = this._dialog
      .open(FileUploadDialogComponent, {
        maxWidth: '100vw !important',
        disableClose: true,
        data: null,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response.status) {
          this.getDocuments();
        }
      });
  }

  // Dosya seçildiğinde çağrılan fonksiyon
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const file = input.files[0];
      console.log('Seçilen dosya:', file);
      // Seçilen dosya ile ilgili işlemleri burada yapabilirsiniz
    }
  }


  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  // public opendetails = (id: string) => {
  //   console.log(id);
  //   this._router.navigate(['filemanager/file-manager-details', id]);
  // };


}

