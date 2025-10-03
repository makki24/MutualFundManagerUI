import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PortfolioService } from '../../../core/services/portfolio.service';
import { AuthService } from '../../../core/services/auth.service';
import { Holding } from '../../../core/models/portfolio.model';

export interface AddDividendDialogData {
  portfolioId: number;
  holding: Holding;
}

export interface DividendRequest {
  dividendAmount: number;
  adminUserId: number;
  exDividendDate?: string;
}

export interface DividendResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    portfolioId: number;
    holdingId: number;
    symbol: string;
    companyName: string;
    dividendPerShare: number;
    eligibleQuantity: number;
    totalDividendAmount: number;
    exDividendDate: string;
    paymentDate: string;
    dividendType: string;
    taxDeducted: number;
    netDividendAmount: number;
    status: string;
    statusDisplayName: string;
    description: string;
    referenceId: string;
    createdById: number;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
    dividendYield: number;
    currentStockPrice: number;
  };
  timestamp: string;
}

@Component({
  selector: 'app-add-dividend-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dividend-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>payments</mat-icon>
          Add Dividend
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="holding-info">
          <div class="holding-details">
            <h3>{{ data.holding.symbol }}</h3>
            <p>{{ data.holding.companyName }}</p>
            <div class="holding-stats">
              <div class="stat">
                <span class="label">Quantity:</span>
                <span class="value">{{ data.holding.quantity | number:'1.0-0' }}</span>
              </div>
              <div class="stat">
                <span class="label">Current Price:</span>
                <span class="value">{{ data.holding.currentPrice | currency:'INR':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>

        <form [formGroup]="dividendForm" class="dividend-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Dividend Amount per Share</mat-label>
            <input
              matInput
              type="number"
              step="0.01"
              min="0.01"
              formControlName="dividendAmount"
              placeholder="Enter dividend amount per share"
              #dividendInput
            >
            <span matTextPrefix>₹</span>
            <mat-error *ngIf="dividendForm.get('dividendAmount')?.hasError('required')">
              Dividend amount is required
            </mat-error>
            <mat-error *ngIf="dividendForm.get('dividendAmount')?.hasError('min')">
              Dividend amount must be greater than 0
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Ex-Dividend Date</mat-label>
            <input
              matInput
              [matDatepicker]="picker"
              formControlName="exDividendDate"
              placeholder="Select ex-dividend date (optional)"
            >
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-hint>Leave empty to use current date</mat-hint>
          </mat-form-field>

          <div class="dividend-preview" *ngIf="dividendForm.get('dividendAmount')?.value > 0">
            <h4>Dividend Preview</h4>
            <div class="preview-stats">
              <div class="preview-stat">
                <span class="label">Dividend per Share:</span>
                <span class="value">{{ dividendForm.get('dividendAmount')?.value | currency:'INR':'symbol':'1.2-2' }}</span>
              </div>
              <div class="preview-stat">
                <span class="label">Eligible Quantity:</span>
                <span class="value">{{ data.holding.quantity | number:'1.0-0' }}</span>
              </div>
              <div class="preview-stat total">
                <span class="label">Total Dividend Amount:</span>
                <span class="value">{{ getTotalDividendAmount() | currency:'INR':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close [disabled]="isLoading">
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="addDividend()"
          [disabled]="!dividendForm.valid || isLoading"
        >
          @if (isLoading) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>payments</mat-icon>
          }
          Add Dividend
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dividend-dialog {
      min-width: 500px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #1976d2;
    }

    .holding-info {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .holding-details h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .holding-details p {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }

    .holding-stats {
      display: flex;
      gap: 24px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat .label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .stat .value {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .dividend-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .dividend-preview {
      background: #e8f5e8;
      border: 1px solid #4caf50;
      border-radius: 8px;
      padding: 16px;
      margin-top: 8px;
    }

    .dividend-preview h4 {
      margin: 0 0 12px 0;
      color: #2e7d32;
      font-size: 16px;
    }

    .preview-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .preview-stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .preview-stat.total {
      border-top: 1px solid #4caf50;
      padding-top: 8px;
      margin-top: 4px;
      font-weight: 600;
    }

    .preview-stat .label {
      color: #2e7d32;
      font-size: 14px;
    }

    .preview-stat .value {
      color: #1b5e20;
      font-weight: 600;
    }

    mat-dialog-actions {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    mat-dialog-actions button {
      margin-left: 8px;
    }

    mat-spinner {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .dividend-dialog {
        min-width: 95vw;
        max-width: 95vw;
      }

      .holding-stats {
        flex-direction: column;
        gap: 12px;
      }

      .preview-stat {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `]
})
export class AddDividendDialogComponent implements OnInit {
  dividendForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private portfolioService: PortfolioService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddDividendDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddDividendDialogData
  ) {
    this.dividendForm = this.fb.group({
      dividendAmount: ['', [Validators.required, Validators.min(0.01)]],
      exDividendDate: ['']
    });
  }

  ngOnInit(): void {
    // Focus on dividend amount input after view init
    setTimeout(() => {
      const dividendInput = document.querySelector('#dividendInput') as HTMLInputElement;
      if (dividendInput) {
        dividendInput.focus();
      }
    }, 100);
  }

  getTotalDividendAmount(): number {
    const dividendAmount = this.dividendForm.get('dividendAmount')?.value || 0;
    return dividendAmount * this.data.holding.quantity;
  }

  addDividend(): void {
    if (!this.dividendForm.valid) {
      return;
    }

    const adminUserId = this.authService.getCurrentUserId();
    if (!adminUserId) {
      this.snackBar.open('Cannot determine current admin user. Please re-login.', 'Close', { duration: 4000 });
      return;
    }

    this.isLoading = true;

    const formValue = this.dividendForm.value;
    const dividendRequest: DividendRequest = {
      dividendAmount: formValue.dividendAmount,
      adminUserId: adminUserId
    };

    // Add ex-dividend date if provided
    if (formValue.exDividendDate) {
      const date = new Date(formValue.exDividendDate);
      dividendRequest.exDividendDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    this.portfolioService.addDividend(
      this.data.portfolioId,
      this.data.holding.symbol,
      dividendRequest
    ).subscribe({
      next: (response: DividendResponse) => {
        this.isLoading = false;
        if (response.success) {
          this.snackBar.open(
            `Dividend added successfully: ₹${response.data.dividendPerShare} per share for ${response.data.symbol}`,
            'Close',
            { duration: 5000 }
          );
          this.dialogRef.close(response.data);
        } else {
          this.snackBar.open(
            response.message || 'Failed to add dividend',
            'Close',
            { duration: 4000 }
          );
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Failed to add dividend:', error);
        const errorMessage = error.error?.message || 'Failed to add dividend';
        this.snackBar.open(errorMessage, 'Close', { duration: 4000 });
      }
    });
  }
}
