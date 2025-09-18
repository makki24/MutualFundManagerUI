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

import { PortfolioService } from '../../../../core/services/portfolio.service';
import { Investment } from '../../../../core/models/investment.model';
import { InvestmentRequest } from '../../../../core/models/portfolio.model';
import {InvestmentService} from '../../../../core/services/investment.service';

export interface InvestMoreDialogData {
  portfolioId: number;
  investment: Investment;
}

@Component({
  selector: 'app-invest-more-dialog',
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
    MatNativeDateModule
  ],
  template: `
    <div class="invest-more-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>trending_up</mat-icon>
          Invest More
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="investor-info">
          <div class="investor-card">
            <div class="investor-details">
              <h3>{{ data.investment.user.username }}</h3>
              <p class="user-id">User ID: {{ data.investment.user.id }}</p>
            </div>
            <div class="current-investment">
              <div class="investment-stat">
                <span class="label">Current Investment</span>
                <span class="value">{{ data.investment.totalInvested | currency:'INR':'symbol':'1.2-2' }}</span>
              </div>
              <div class="investment-stat">
                <span class="label">Units Held</span>
                <span class="value">{{ data.investment.unitsHeld | number:'1.4-4' }}</span>
              </div>
              <div class="investment-stat">
                <span class="label">Current Value</span>
                <span class="value">{{ data.investment.currentValue | currency:'INR':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>

        <form [formGroup]="investForm" class="invest-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Additional Investment Amount</mat-label>
            <input matInput
                   type="number"
                   formControlName="amount"
                   placeholder="Enter amount to invest"
                   min="1"
                   step="0.01">
            <span matTextPrefix>₹&nbsp;</span>
            @if (investForm.get('amount')?.hasError('required')) {
              <mat-error>Investment amount is required</mat-error>
            }
            @if (investForm.get('amount')?.hasError('min')) {
              <mat-error>Investment amount must be greater than 0</mat-error>
            }
          </mat-form-field>

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


          @if (investForm.get('amount')?.value > 0) {
            <div class="investment-preview">
              <h4>Investment Preview</h4>
              <div class="preview-stats">
                <div class="preview-stat">
                  <span class="label">Additional Investment</span>
                  <span class="value">{{ investForm.get('amount')?.value | currency:'INR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="preview-stat">
                  <span class="label">New Total Investment</span>
                  <span class="value">{{ (data.investment.totalInvested + (investForm.get('amount')?.value || 0)) | currency:'INR':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            </div>
          }
        </form>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button
                color="primary"
                (click)="onInvest()"
                [disabled]="investForm.invalid || isLoading">
          @if (isLoading) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>add_circle</mat-icon>
          }
          Invest More
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .invest-more-dialog {
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

    .dialog-header mat-icon {
      color: #1976d2;
    }

    .investor-info {
      margin-bottom: 24px;
    }

    .investor-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      border-left: 4px solid #1976d2;
    }

    .investor-details h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    .user-id {
      margin: 0 0 16px 0;
      font-size: 12px;
      color: #666;
    }

    .current-investment {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .investment-stat {
      display: flex;
      flex-direction: column;
    }

    .investment-stat .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .investment-stat .value {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .invest-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .datetime-container {
      display: flex;
      gap: 12px;
      width: 100%;
    }

    .date-field {
      flex: 2;
    }

    .time-field {
      flex: 1;
    }

    .investment-preview {
      background: #e3f2fd;
      border-radius: 8px;
      padding: 16px;
      margin-top: 8px;
    }

    .investment-preview h4 {
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

    mat-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
      margin-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    mat-dialog-actions button {
      min-width: 100px;
    }

    mat-dialog-actions mat-spinner {
      margin-right: 8px;
    }

    @media (max-width: 600px) {
      .invest-more-dialog {
        min-width: unset;
        width: 100%;
        max-width: 100%;
      }

      .current-investment {
        grid-template-columns: 1fr;
        gap: 12px;
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
export class InvestMoreDialogComponent implements OnInit {
  // LocalStorage key for datetime preferences
  private readonly DATETIME_STORAGE_KEY = 'investMore_datetime_preferences';
  
  investForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private investmentService: InvestmentService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<InvestMoreDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InvestMoreDialogData
  ) {
    // Load saved datetime preferences from localStorage
    const savedDatetime = this.loadDatetimePreferences();
    
    this.investForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      transactionDate: [savedDatetime.date || null], // Optional transaction date
      transactionTime: [savedDatetime.time || null] // Optional transaction time
    });
  }

  ngOnInit(): void {
    // Setup datetime change listeners
    this.setupDatetimeListeners();
    
    // Focus on amount field when dialog opens
    setTimeout(() => {
      const amountInput = document.querySelector('input[formControlName="amount"]') as HTMLInputElement;
      if (amountInput) {
        amountInput.focus();
      }
    }, 100);
  }

  /**
   * Setup listeners for datetime changes to save to localStorage
   */
  private setupDatetimeListeners(): void {
    this.investForm.get('transactionDate')?.valueChanges.subscribe(() => {
      this.saveDatetimePreferences();
    });

    this.investForm.get('transactionTime')?.valueChanges.subscribe(() => {
      this.saveDatetimePreferences();
    });
  }

  /**
   * Load datetime preferences from localStorage
   */
  private loadDatetimePreferences(): { date: string; time: string } {
    try {
      const saved = localStorage.getItem(this.DATETIME_STORAGE_KEY);
      if (saved) {
        const preferences = JSON.parse(saved);
        return {
          date: preferences.date || '',
          time: preferences.time || ''
        };
      }
    } catch (error) {
      console.warn('Failed to load datetime preferences from localStorage:', error);
    }
    
    return { date: '', time: '' };
  }

  /**
   * Save current datetime preferences to localStorage
   */
  private saveDatetimePreferences(): void {
    try {
      const dateValue = this.investForm.get('transactionDate')?.value;
      const timeValue = this.investForm.get('transactionTime')?.value;
      
      const preferences = {
        date: dateValue || '',
        time: timeValue || '',
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(this.DATETIME_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save datetime preferences to localStorage:', error);
    }
  }

  private combineDateTime(): Date | undefined {
    const dateValue = this.investForm.get('transactionDate')?.value;
    const timeValue = this.investForm.get('transactionTime')?.value;

    if (!dateValue && !timeValue) {
      return undefined; // No date or time specified, use current datetime
    }

    if (dateValue && !timeValue) {
      // Date specified but no time, use current time
      const now = new Date();
      const combinedDate = new Date(dateValue);
      combinedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      return combinedDate;
    }

    if (!dateValue && timeValue) {
      // Time specified but no date, use current date
      const now = new Date();
      const [hours, minutes] = timeValue.split(':');
      now.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return now;
    }

    // Both date and time specified
    const combinedDate = new Date(dateValue);
    const [hours, minutes] = timeValue.split(':');
    combinedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return combinedDate;
  }

  onInvest(): void {
    if (this.investForm.valid) {
      this.isLoading = true;

      const investmentRequest: InvestmentRequest = {
        investmentAmount: this.investForm.get('amount')?.value
      };

      const transactionDate = this.combineDateTime();
      
      this.investmentService.investInPortfolio(
        this.data.portfolioId,
        this.data.investment.user.id,
        this.investForm.get('amount')?.value,
        1,
        transactionDate
      ).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.dialogRef.close(true);
          this.snackBar.open(
            `Successfully invested ₹${investmentRequest.investmentAmount.toLocaleString()} for ${this.data.investment.user.username}`,
            'Close',
            { duration: 5000 }
          );
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Investment failed:', error);
          this.snackBar.open(
            error.error?.message || 'Failed to process investment. Please try again.',
            'Close',
            { duration: 5000 }
          );
        }
      });
    }
  }
}
