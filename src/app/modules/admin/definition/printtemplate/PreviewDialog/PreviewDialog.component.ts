import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-PreviewDialog',
  templateUrl: './PreviewDialog.component.html',
  styleUrls: ['./PreviewDialog.component.css']
})
export class PreviewDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PreviewDialogComponent>,  
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {}

  closeDialog(): void {
    this.dialogRef.close(); 
  }
  
  ngOnInit() {
  }

}
