import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

function toYyyyMmDd(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

@Component({
  selector: 'app-update-by-date-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Update Prices by Date</h2>
    <div mat-dialog-content>
      <mat-form-field appearance="fill" style="width: 100%">
        <mat-label>Select date</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="selected" />
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button type="button" (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" type="button" [disabled]="!selected" (click)="onConfirm()">Update</button>
    </div>
  `,
})
export class UpdateByDateDialogComponent {
  private dialogRef = inject(MatDialogRef<UpdateByDateDialogComponent, string | null>);

  selected: Date | null = new Date();

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onConfirm(): void {
    if (this.selected) {
      this.dialogRef.close(toYyyyMmDd(this.selected));
    }
  }
}
