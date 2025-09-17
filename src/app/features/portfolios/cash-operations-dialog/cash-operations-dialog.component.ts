import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { PortfolioService } from '../../../core/services/portfolio.service';
import { AuthService } from '../../../core/services/auth.service';

export interface CashOperationsDialogData {
  portfolioId: number;
  portfolioName: string;
  operation?: 'add' | 'withdraw'; // Optional, defaults to 'add'
}

@Component({
  selector: 'app-cash-operations-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule
  ],
  template: `
    <div class="cash-operations-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>{{ operation === 'add' ? 'add_circle' : 'remove_circle' }}</mat-icon>
          {{ operation === 'add' ? 'Add Cash' : 'Withdraw Cash' }} - {{ data.portfolioName }}
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="operation-selector">
          <mat-button-toggle-group
            [value]="operation"
            (change)="onOperationChange($event.value)"
            class="operation-toggle">
            <mat-button-toggle value="add">
              <mat-icon>add_circle</mat-icon>
              Add Cash
            </mat-button-toggle>
            <mat-button-toggle value="withdraw">
              <mat-icon>remove_circle</mat-icon>
              Withdraw Cash
            </mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        <form [formGroup]="cashForm" class="cash-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Amount</mat-label>
            <input matInput
                   type="number"
                   formControlName="amount"
                   placeholder="Enter amount"
                   min="0.01"
                   step="0.01">
            <span matTextPrefix>₹&nbsp;</span>
            @if (cashForm.get('amount')?.hasError('required')) {
              <mat-error>Amount is required</mat-error>
            }
            @if (cashForm.get('amount')?.hasError('min')) {
              <mat-error>Amount must be greater than 0</mat-error>
            }
          </mat-form-field>

          <!-- Transaction Date and Time -->
          <div class="datetime-container">
            <mat-form-field appearance="outline" class="date-field">
              <mat-label>Transaction Date (Optional)</mat-label>
              <input matInput
                     [matDatepicker]="transactionDatePicker"
                     formControlName="transactionDate"
                     placeholder="Select transaction date">
              <mat-datepicker-toggle matIconSuffix [for]="transactionDatePicker"></mat-datepicker-toggle>
              <mat-datepicker #transactionDatePicker></mat-datepicker>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="time-field">
              <mat-label>Time (Optional)</mat-label>
              <input matInput
                     type="time"
                     formControlName="transactionTime"
                     placeholder="Select time">
              <mat-hint>Leave empty to use current date and time</mat-hint>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description (Optional)</mat-label>
            <textarea matInput
                      formControlName="description"
                      rows="2"
                      placeholder="Enter description for this transaction"></textarea>
          </mat-form-field>

          @if (cashForm.get('amount')?.value > 0) {
            <div class="transaction-preview">
              <h4>Transaction Preview</h4>
              <div class="preview-stats">
                <div class="preview-stat">
                  <span class="label">Operation</span>
                  <span class="value {{ operation === 'add' ? 'positive' : 'negative' }}">
                    {{ operation === 'add' ? 'Add Cash' : 'Withdraw Cash' }}
                  </span>
                </div>
                <div class="preview-stat">
                  <span class="label">Amount</span>
                  <span class="value {{ operation === 'add' ? 'positive' : 'negative' }}">
                    {{ operation === 'add' ? '+' : '-' }}{{ cashForm.get('amount')?.value | currency:'INR':'symbol':'1.2-2' }}
                  </span>
                </div>
                <div class="preview-stat">
                  <span class="label">Date</span>
                  <span class="value">
                    {{ cashForm.get('transactionDate')?.value ? (cashForm.get('transactionDate')?.value | date:'mediumDate') : 'Today' }}
                  </span>
                </div>
              </div>
            </div>
          }
        </form>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button
                [color]="operation === 'add' ? 'primary' : 'warn'"
                (click)="onSubmit()"
                [disabled]="cashForm.invalid || isLoading">
          @if (isLoading) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>{{ operation === 'add' ? 'add_circle' : 'remove_circle' }}</mat-icon>
          }
          {{ operation === 'add' ? 'Add Cash' : 'Withdraw Cash' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .cash-operations-dialog {
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

    .operation-selector {
      margin-bottom: 24px;
      display: flex;
      justify-content: center;
    }

    .operation-toggle {
      height: 40px;
    }

    .operation-toggle mat-button-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
    }

    .cash-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .transaction-preview {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-top: 8px;
      border-left: 4px solid #1976d2;
    }

    .transaction-preview h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 500;
      color: #1976d2;
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

    .preview-stat .label {
      font-size: 13px;
      color: #666;
    }

    .preview-stat .value {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .preview-stat .value.positive {
      color: #4caf50;
    }

    .preview-stat .value.negative {
      color: #f44336;
    }

    mat-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
      margin-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    mat-dialog-actions button {
      min-width: 120px;
    }

    mat-dialog-actions mat-spinner {
      margin-right: 8px;
    }

    @media (max-width: 600px) {
      .cash-operations-dialog {
        min-width: unset;
        width: 100%;
        max-width: 100%;
      }

      .operation-toggle {
        width: 100%;
      }

      mat-dialog-actions {
        flex-direction: column-reverse;
      }

      mat-dialog-actions button {
        width: 100%;
      }
    }
  `]
})
export class CashOperationsDialogComponent implements OnInit {
  cashForm: FormGroup;
  isLoading = false;
  operation: 'add' | 'withdraw' = 'add';

  constructor(
    private fb: FormBuilder,
    private portfolioService: PortfolioService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CashOperationsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CashOperationsDialogData
  ) {
    this.operation = data.operation || 'add';
    this.cashForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      transactionDate: [null], // Optional transaction date
      transactionTime: [null], // Optional transaction time
      description: [''] // Optional description
    });
  }

  ngOnInit(): void {
    // Focus on amount field when dialog opens
    setTimeout(() => {
      const amountInput = document.querySelector('input[formControlName="amount"]') as HTMLInputElement;
      if (amountInput) {
        amountInput.focus();
      }
    }, 100);
  }

  onOperationChange(newOperation: 'add' | 'withdraw'): void {
    this.operation = newOperation;
  }

  onSubmit(): void {
    if (this.cashForm.valid) {
      this.isLoading = true;
      
      const amount = this.cashForm.get('amount')?.value;
      const transactionDate = this.cashForm.get('transactionDate')?.value;
      const adminUserId = this.authService.getCurrentUser()?.id || 1;

      const operation = this.operation === 'add' 
        ? this.portfolioService.addCash(this.data.portfolioId, amount, adminUserId, transactionDate)
        : this.portfolioService.withdrawCash(this.data.portfolioId, amount, adminUserId, transactionDate);

      operation.subscribe({
        next: (response) => {
          this.isLoading = false;
          this.dialogRef.close(true);
          
          const operationText = this.operation === 'add' ? 'added to' : 'withdrawn from';
          this.snackBar.open(
            `Successfully ${operationText} ${this.data.portfolioName}: ₹${amount.toLocaleString()}`,
            'Close',
            { duration: 5000 }
          );
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Cash operation failed:', error);
          
          const operationText = this.operation === 'add' ? 'add cash to' : 'withdraw cash from';
          this.snackBar.open(
            error.error?.message || `Failed to ${operationText} portfolio. Please try again.`,
            'Close',
            { duration: 5000 }
          );
        }
      });
    }
  }
}
