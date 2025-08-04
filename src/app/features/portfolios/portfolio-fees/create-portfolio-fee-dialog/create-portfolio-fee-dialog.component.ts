import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_NATIVE_DATE_FORMATS,
  MatNativeDateModule,
  NativeDateAdapter
} from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PortfolioFeeService } from '../../../../core/services/portfolio-fee.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CreatePortfolioFeeRequest } from '../../../../core/models/portfolio.model';

interface DialogData {
  portfolioId: number;
}

interface FeePreview {
  totalDays: number;
  dailyRate: number;
  totalFeeAmount: number;
}

@Component({
  selector: 'app-create-portfolio-fee-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  providers:[
    {provide: DateAdapter, useClass: NativeDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS}
  ],
  templateUrl: './create-portfolio-fee-dialog.component.html',
  styleUrls: ['./create-portfolio-fee-dialog.component.scss']
})
export class CreatePortfolioFeeDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private portfolioFeeService = inject(PortfolioFeeService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<CreatePortfolioFeeDialogComponent>);

  createFeeForm: FormGroup;
  isSubmitting = false;
  feePreview: FeePreview | null = null;
  minDate = new Date();

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.createFeeForm = this.fb.group({
      totalFeeAmount: [0, [Validators.required, Validators.min(0)]],
      fromDate: [new Date(), [Validators.required]],
      toDate: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    // Set minimum date for fromDate to today
    this.createFeeForm.get('fromDate')?.setValue(new Date());

    // Watch for form changes to update preview
    this.createFeeForm.valueChanges.subscribe(() => {
      this.updateFeePreview();
    });

    // Custom validator for date range
    this.createFeeForm.addValidators(this.dateRangeValidator.bind(this));

    // Initial preview calculation
    this.updateFeePreview();
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup;
    const fromDate = form.get('fromDate')?.value;
    const toDate = form.get('toDate')?.value;

    if (fromDate && toDate && new Date(toDate) <= new Date(fromDate)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  updateFeePreview(): void {
    const formValue = this.createFeeForm.value;

    if (formValue.fromDate && formValue.toDate && formValue.totalFeeAmount >= 0) {
      const fromDate = new Date(formValue.fromDate);
      const toDate = new Date(formValue.toDate);

      if (toDate > fromDate) {
        const timeDiff = toDate.getTime() - fromDate.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        const dailyRate = totalDays > 0 ? formValue.totalFeeAmount / totalDays : 0;

        this.feePreview = {
          totalDays,
          dailyRate,
          totalFeeAmount: formValue.totalFeeAmount
        };
      } else {
        this.feePreview = null;
      }
    } else {
      this.feePreview = null;
    }
  }

  onFromDateChange(): void {
    const fromDate = this.createFeeForm.get('fromDate')?.value;
    if (fromDate) {
      // Set minimum date for toDate to be the day after fromDate
      const minToDate = new Date(fromDate);
      minToDate.setDate(minToDate.getDate() + 1);

      // If current toDate is before the new minimum, reset it
      const currentToDate = this.createFeeForm.get('toDate')?.value;
      if (!currentToDate || new Date(currentToDate) <= fromDate) {
        this.createFeeForm.get('toDate')?.setValue(minToDate);
      }
    }
  }

  createFee(): void {
    if (this.createFeeForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      this.isSubmitting = false;
      return;
    }

    const request: CreatePortfolioFeeRequest = {
      totalFeeAmount: this.createFeeForm.value.totalFeeAmount,
      fromDate: this.createFeeForm.value.fromDate.toISOString().split('T')[0],
      toDate: this.createFeeForm.value.toDate.toISOString().split('T')[0],
      description: this.createFeeForm.value.description || undefined
    };

    this.portfolioFeeService.createPortfolioFee(this.data.portfolioId, request, currentUser.id).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Failed to create portfolio fee:', error);
        this.snackBar.open(
          error.error?.message || 'Failed to create portfolio fee. Please try again.',
          'Close',
          { duration: 5000 }
        );
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createFeeForm.controls).forEach(key => {
      const control = this.createFeeForm.get(key);
      control?.markAsTouched();
    });
  }

  getFormErrorMessage(fieldName: string): string {
    const control = this.createFeeForm.get(fieldName);

    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }

    if (control?.hasError('min')) {
      return `${this.getFieldDisplayName(fieldName)} must be non-negative`;
    }

    if (fieldName === 'toDate' && this.createFeeForm.hasError('dateRangeInvalid')) {
      return 'To date must be after from date';
    }

    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      totalFeeAmount: 'Fee amount',
      fromDate: 'From date',
      toDate: 'To date',
      description: 'Description'
    };
    return displayNames[fieldName] || fieldName;
  }

  hasFormError(fieldName: string): boolean {
    const control = this.createFeeForm.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }
}
