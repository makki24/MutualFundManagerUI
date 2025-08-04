import { Component, inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { PortfolioService } from '../../../core/services/portfolio.service';
import { AuthService } from '../../../core/services/auth.service';
import { PortfolioFee, CreatePortfolioFeeRequest, UserFeeAllocation } from '../../../core/models/portfolio.model';

interface DialogData {
  portfolioId: number;
  portfolioName: string;
}

@Component({
  selector: 'app-portfolio-fee-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './portfolio-fee-management.component.html',
  styleUrls: ['./portfolio-fee-management.component.scss']
})
export class PortfolioFeeManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private portfolioService = inject(PortfolioService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<PortfolioFeeManagementComponent>);

  feeForm: FormGroup;
  activeFee: PortfolioFee | null = null;
  feeAllocations: UserFeeAllocation[] = [];
  isLoading = false;

  allocationColumns = ['user', 'amount', 'units', 'date', 'type'];

  constructor() {
    this.feeForm = this.createFeeForm();
  }

  public data = inject(MAT_DIALOG_DATA) as DialogData;

  ngOnInit(): void {
    this.loadActiveFee();
    this.loadFeeAllocations();
  }

  private createFeeForm(): FormGroup {
    return this.fb.group({
      totalFeeAmount: ['', [Validators.required, Validators.min(0)]],
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      description: ['']
    }, { validators: this.dateRangeValidator });
  }

  private dateRangeValidator(group: FormGroup) {
    const fromDate = group.get('fromDate')?.value;
    const toDate = group.get('toDate')?.value;

    if (fromDate && toDate && new Date(toDate) <= new Date(fromDate)) {
      group.get('toDate')?.setErrors({ dateRange: true });
      return { dateRange: true };
    }

    return null;
  }

  loadActiveFee(): void {
    this.portfolioService.getPortfolioFees(this.data.portfolioId, true).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          this.activeFee = response.data[0];
        }
      },
      error: (error) => {
        console.error('Failed to load active fee:', error);
      }
    });
  }

  loadFeeAllocations(): void {
    this.portfolioService.getPortfolioFeeAllocations(this.data.portfolioId).subscribe({
      next: (response) => {
        if (response.success) {
          this.feeAllocations = response.data || [];
        }
      },
      error: (error) => {
        console.error('Failed to load fee allocations:', error);
      }
    });
  }

  getFeeTypeColor(feeType: string): string {
    switch (feeType) {
      case 'MANAGEMENT_FEE': return 'primary';
      case 'ADMINISTRATIVE_FEE': return 'accent';
      case 'PERFORMANCE_FEE': return 'warn';
      default: return 'basic';
    }
  }

  calculateTotalDays(): number {
    const fromDate = this.feeForm.get('fromDate')?.value;
    const toDate = this.feeForm.get('toDate')?.value;

    if (fromDate && toDate) {
      const diffTime = Math.abs(new Date(toDate).getTime() - new Date(fromDate).getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    return 0;
  }

  calculateDailyAmount(): number {
    const totalAmount = this.feeForm.get('totalFeeAmount')?.value;
    const totalDays = this.calculateTotalDays();

    if (totalAmount && totalDays > 0) {
      return totalAmount / totalDays;
    }

    return 0;
  }

  createFee(): void {
    if (this.feeForm.invalid) return;

    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      this.isLoading = false;
      return;
    }

    const feeRequest: CreatePortfolioFeeRequest = {
      totalFeeAmount: this.feeForm.get('totalFeeAmount')?.value,
      fromDate: this.formatDate(this.feeForm.get('fromDate')?.value),
      toDate: this.formatDate(this.feeForm.get('toDate')?.value),
      description: this.feeForm.get('description')?.value || undefined
    };

    this.portfolioService.createPortfolioFee(this.data.portfolioId, feeRequest, currentUser.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.snackBar.open('Portfolio fee created successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          error.error?.message || 'Failed to create portfolio fee. Please try again.',
          'Close',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  deactivateFee(feeId: number): void {
    this.isLoading = true;

    this.portfolioService.deactivatePortfolioFee(this.data.portfolioId, feeId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.snackBar.open('Portfolio fee deactivated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          error.error?.message || 'Failed to deactivate portfolio fee. Please try again.',
          'Close',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }
}
