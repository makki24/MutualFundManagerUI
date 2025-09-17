import { Component, inject, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { InvestmentService } from '../../../../core/services/investment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Investment } from '../../../../core/models/investment.model';

export interface WithdrawUserForm {
  unitsToWithdraw: number;
}

export interface WithdrawalImpact {
  unitsToWithdraw: number;
  withdrawalAmount: number;
  remainingUnits: number;
  remainingValue: number;
  withdrawalPercentage: number;
}

@Component({
  selector: 'app-withdraw-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Withdraw User from Portfolio</h2>

    <mat-dialog-content>
      <form [formGroup]="withdrawForm" class="withdraw-form">

        <!-- User Information -->
        <mat-card class="user-info-card">
          <mat-card-header>
            <mat-card-title>Investor Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="user-details">
              <div class="detail-row">
                <span class="label">Investor:</span>
                <span class="value">{{ data.investment.user.username }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Investment:</span>
                <span class="value">{{ data.investment.totalInvested | currency }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Current Value:</span>
                <span class="value">{{ data.investment.currentValue | currency }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Units Held:</span>
                <span class="value">{{ data.investment.unitsHeld | number:'1.4-4' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Returns:</span>
                <span class="value"
                      [class.positive]="data.investment.totalReturns >= 0"
                      [class.negative]="data.investment.totalReturns < 0">
                  {{ data.investment.totalReturns >= 0 ? '+' : '' }}{{ data.investment.totalReturns | currency }}
                  ({{ data.investment.returnPercentage | number:'1.2-2' }}%)
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Withdrawal Amount -->
        <div class="withdrawal-section">
          <h3>Withdrawal Details</h3>

          <!-- Units to Withdraw -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Units to Withdraw</mat-label>
            <input matInput
                   type="number"
                   formControlName="unitsToWithdraw"
                   placeholder="0.0000"
                   min="0.0001"
                   [max]="data.investment.unitsHeld"
                   step="0.0001"
                   (input)="calculateWithdrawalImpact()"
                   required>
            <mat-hint>Maximum: {{ data.investment.unitsHeld | number:'1.4-4' }} units</mat-hint>
            <mat-error *ngIf="withdrawForm.get('unitsToWithdraw')?.hasError('required')">
              Units to withdraw is required
            </mat-error>
            <mat-error *ngIf="withdrawForm.get('unitsToWithdraw')?.hasError('min')">
              Must withdraw at least 0.0001 units
            </mat-error>
            <mat-error *ngIf="withdrawForm.get('unitsToWithdraw')?.hasError('max')">
              Cannot withdraw more than {{ data.investment.unitsHeld | number:'1.4-4' }} units
            </mat-error>
          </mat-form-field>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <button mat-button type="button" (click)="setWithdrawalPercentage(25)">25%</button>
            <button mat-button type="button" (click)="setWithdrawalPercentage(50)">50%</button>
            <button mat-button type="button" (click)="setWithdrawalPercentage(75)">75%</button>
            <button mat-button type="button" (click)="setWithdrawalPercentage(100)">100%</button>
          </div>

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
        </div>

        <!-- Withdrawal Impact Preview -->
        @if (withdrawalImpact) {
          <mat-card class="impact-card">
            <mat-card-header>
              <mat-card-title>Withdrawal Impact</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="impact-details">
                <div class="impact-row">
                  <span class="label">Units to Withdraw:</span>
                  <span class="value">{{ withdrawalImpact.unitsToWithdraw | number:'1.4-4' }}</span>
                </div>
                <div class="impact-row">
                  <span class="label">Withdrawal Amount:</span>
                  <span class="value withdrawal-amount">{{ withdrawalImpact.withdrawalAmount | currency }}</span>
                </div>
                <div class="impact-row">
                  <span class="label">Remaining Units:</span>
                  <span class="value">{{ withdrawalImpact.remainingUnits | number:'1.4-4' }}</span>
                </div>
                <div class="impact-row">
                  <span class="label">Remaining Value:</span>
                  <span class="value">{{ withdrawalImpact.remainingValue | currency }}</span>
                </div>
                <div class="impact-row total">
                  <span class="label">Withdrawal Percentage:</span>
                  <span class="value">{{ withdrawalImpact.withdrawalPercentage | number:'1.2-2' }}%</span>
                </div>
              </div>

              @if (withdrawalImpact.withdrawalPercentage === 100) {
                <div class="full-withdrawal-warning">
                  <mat-icon color="warn">warning</mat-icon>
                  <span>This will completely remove the user from the portfolio</span>
                </div>
              }
            </mat-card-content>
          </mat-card>
        }


      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button
              color="warn"
              [disabled]="withdrawForm.invalid || isSubmitting"
              (click)="processWithdrawal()">
        @if (isSubmitting) {
          <mat-spinner diameter="20"></mat-spinner>
        }
        Process Withdrawal
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .withdraw-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-width: 500px;
    }

    .full-width {
      width: 100%;
    }

    .user-info-card {
      margin-bottom: 20px;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .value {
      font-weight: 500;
    }

    .value.positive {
      color: #4caf50;
    }

    .value.negative {
      color: #f44336;
    }

    .withdrawal-section h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .quick-actions {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin: 16px 0;
    }

    .impact-card {
      margin: 20px 0;
    }

    .impact-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .impact-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .impact-row.total {
      border-bottom: 2px solid #333;
      font-weight: 500;
    }

    .impact-row:last-child {
      border-bottom: none;
    }

    .withdrawal-amount {
      color: #f44336;
      font-weight: 600;
    }

    .full-withdrawal-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      background: #fff3e0;
      border-radius: 8px;
      color: #f57c00;
    }

    .datetime-container {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .date-field {
      flex: 1;
    }

    .time-field {
      flex: 1;
    }

    @media (max-width: 600px) {
      .datetime-container {
        flex-direction: column;
        gap: 12px;
      }
      
      .date-field,
      .time-field {
        width: 100%;
      }
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
    }

    mat-dialog-actions button {
      margin-left: 8px;
    }

    @media (max-width: 600px) {
      .withdraw-form {
        min-width: 300px;
      }

      .detail-row, .impact-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .quick-actions {
        flex-wrap: wrap;
      }
    }
  `]
})
export class WithdrawUserDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<WithdrawUserDialogComponent>);
  private investmentService = inject(InvestmentService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  withdrawForm: FormGroup;
  withdrawalImpact: WithdrawalImpact | null = null;
  isSubmitting = false;
  withdrawalPercentage = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { portfolioId: number; investment: Investment }) {
    this.withdrawForm = this.fb.group({
      unitsToWithdraw: [this.data.investment.unitsHeld, [
        Validators.required,
        Validators.min(0.0001),
        Validators.max(this.data.investment.unitsHeld)
      ]],
      transactionDate: [null], // Optional transaction date
      transactionTime: [null] // Optional transaction time
    });
  }

  ngOnInit() {
    this.setupFormValidation();
    // Set default to 100% withdrawal
    this.setWithdrawalPercentage(100);
  }

  private setupFormValidation() {
    this.withdrawForm.get('unitsToWithdraw')?.valueChanges.subscribe(() => {
      this.calculateWithdrawalImpact();
    });
  }

  calculateWithdrawalImpact() {
    const unitsToWithdraw = this.withdrawForm.get('unitsToWithdraw')?.value;

    if (!unitsToWithdraw || unitsToWithdraw <= 0) {
      this.withdrawalImpact = null;
      this.withdrawalPercentage = 0;
      return;
    }

    const investment = this.data.investment;
    const navValue = investment.currentValue / investment.unitsHeld; // Calculate current NAV
    const withdrawalAmount = unitsToWithdraw * navValue;
    const remainingUnits = investment.unitsHeld - unitsToWithdraw;
    const remainingValue = remainingUnits * navValue;
    const withdrawalPercentage = (unitsToWithdraw / investment.unitsHeld) * 100;

    this.withdrawalImpact = {
      unitsToWithdraw,
      withdrawalAmount,
      remainingUnits,
      remainingValue,
      withdrawalPercentage
    };

    this.withdrawalPercentage = withdrawalPercentage;
  }

  onSliderChange(event: any) {
    const percentage = event.target.value;
    this.setWithdrawalPercentage(percentage);
  }

  setWithdrawalPercentage(percentage: number) {
    const unitsToWithdraw = (this.data.investment.unitsHeld * percentage) / 100;
    this.withdrawForm.patchValue({
      unitsToWithdraw: unitsToWithdraw
    });
    this.withdrawalPercentage = percentage;
    this.calculateWithdrawalImpact();
  }

  private combineDateTime(): Date | undefined {
    const dateValue = this.withdrawForm.get('transactionDate')?.value;
    const timeValue = this.withdrawForm.get('transactionTime')?.value;

    if (!dateValue && !timeValue) {
      return undefined; // No date or time specified, use current datetime
    }

    if (dateValue && !timeValue) {
      // Date only - use current time
      const now = new Date();
      const combinedDate = new Date(dateValue);
      combinedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      return combinedDate;
    }

    if (!dateValue && timeValue) {
      // Time only - use current date
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

  processWithdrawal() {
    if (this.withdrawForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const unitsToWithdraw = this.withdrawForm.get('unitsToWithdraw')?.value;
    const adminUserId = this.authService.getCurrentUser()?.id || 1;

    const transactionDate = this.combineDateTime();
    
    this.investmentService.withdrawFromPortfolio(
      this.data.portfolioId,
      this.data.investment.user.id,
      unitsToWithdraw,
      adminUserId,
      transactionDate
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.dialogRef.close(response.data);
        } else {
          this.snackBar.open(response.message || 'Failed to process withdrawal', 'Close', { duration: 5000 });
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Failed to process withdrawal:', error);
        this.snackBar.open(error.error?.message || 'Failed to process withdrawal', 'Close', { duration: 5000 });
        this.isSubmitting = false;
      }
    });
  }
}
