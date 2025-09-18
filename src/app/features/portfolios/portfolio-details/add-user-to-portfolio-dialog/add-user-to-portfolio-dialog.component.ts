import { Component, inject, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs';

import { UserService } from '../../../../core/services/user.service';
import { InvestmentService } from '../../../../core/services/investment.service';
import { PortfolioService } from '../../../../core/services/portfolio.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Investment } from '../../../../core/models/investment.model';
import { PortfolioFee } from '../../../../core/models/portfolio.model';

export interface AddUserToPortfolioForm {
  userId: number;
  investmentAmount: number;
  confirmFeeImpact: boolean;
}

export interface FeeImpactPreview {
  feeAmount: number;
  netInvestment: number;
  unitsAllocated: number;
  activeFee?: PortfolioFee | null;
  currentUserCount: number;
  existingUsersImpact: UserFeeImpact[];
}

export interface UserFeeImpact {
  userId: number;
  userName: string;
  creditAmount: number;
  creditUnits: number;
}

@Component({
  selector: 'app-add-user-to-portfolio-dialog',
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
    MatCardModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Add User to Portfolio</h2>

    <mat-dialog-content>
      <form [formGroup]="addUserForm" class="add-user-form">

        <!-- User Selection with Dropdown -->
        <mat-form-field appearance="outline" class="full-width user-select-field">
          <mat-label>Select User</mat-label>
          <mat-select formControlName="userId"
                      placeholder="Choose a user to add"
                      (selectionChange)="onUserSelected($event)"
                      required>
            @if (isLoadingUsers) {
              <mat-option disabled>
                <div class="loading-option">
                  <mat-spinner diameter="20"></mat-spinner>
                  <span>Loading users...</span>
                </div>
              </mat-option>
            } @else {
              @for (user of availableUsers; track user.id) {
                <mat-option [value]="user.id">
                  <div class="user-option">
                    <div class="user-info">
                      <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                      <span class="user-details">{{ user.email }} • @{{ user.username }}</span>
                    </div>
                    <div class="user-role">
                      <span class="role-badge" [class.admin]="user.role === 'ADMIN'">
                        {{ user.role }}
                      </span>
                    </div>
                  </div>
                </mat-option>
              }
              @if (availableUsers.length === 0 && !isLoadingUsers) {
                <mat-option disabled>
                  No available users found
                </mat-option>
              }
            }
          </mat-select>
          <mat-icon matSuffix>person</mat-icon>
          @if(addUserForm.get('userId')?.hasError('required')) {
            <mat-error>
              Please select a user
            </mat-error>
          }
          <mat-hint>Select a user who is not already invested in this portfolio</mat-hint>
        </mat-form-field>

        <!-- Selected User Display -->
        @if (selectedUser) {
          <mat-card class="selected-user-card">
            <mat-card-content>
              <div class="selected-user-info">
                <div class="user-avatar">
                  {{ getUserInitials(selectedUser) }}
                </div>
                <div class="user-details">
                  <h4>{{ selectedUser.firstName }} {{ selectedUser.lastName }}</h4>
                  <p>{{ selectedUser.email }}</p>
                  <p>@{{ selectedUser.username }}</p>
                  <span class="role-badge" [class.admin]="selectedUser.role === 'ADMIN'">
                    {{ selectedUser.role }}
                  </span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }

        <!-- Investment Amount -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Investment Amount</mat-label>
          <input matInput
                 type="number"
                 formControlName="investmentAmount"
                 placeholder="0.00"
                 min="1"
                 step="0.01"
                 (input)="calculateFeeImpact()"
                 required>
          <span matPrefix>₹&nbsp;</span>
          <mat-icon matSuffix>account_balance_wallet</mat-icon>
          <mat-hint>Minimum investment: ₹1</mat-hint>
          <mat-error *ngIf="addUserForm.get('investmentAmount')?.hasError('required')">
            Investment amount is required
          </mat-error>
          <mat-error *ngIf="addUserForm.get('investmentAmount')?.hasError('min')">
            Investment amount must be at least ₹1
          </mat-error>
        </mat-form-field>

        <!-- Transaction DateTime -->
        <div class="datetime-container">
          <mat-form-field appearance="outline" class="date-field">
            <mat-label>Transaction Date</mat-label>
            <input matInput 
                   [matDatepicker]="picker" 
                   formControlName="transactionDate"
                   placeholder="Select date">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-hint>Optional: Leave blank for current date</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="time-field">
            <mat-label>Transaction Time</mat-label>
            <input matInput 
                   type="time" 
                   formControlName="transactionTime"
                   placeholder="Select time">
            <mat-hint>Optional: Leave blank for current time</mat-hint>
          </mat-form-field>
        </div>

        <!-- Fee Impact Preview -->
        @if (feeImpact && selectedUser) {
          <mat-card class="fee-impact-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>analytics</mat-icon>
                Investment Impact Preview
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>

              <!-- Investment Summary -->
              <div class="impact-section">
                <h4>Investment Summary</h4>
                <div class="summary-row">
                  <span>Gross Investment:</span>
                  <span class="amount">{{ addUserForm.get('investmentAmount')?.value | currency:'INR':'symbol':'1.2-2' }}</span>
                </div>
                @if (feeImpact.feeAmount > 0) {
                  <div class="summary-row">
                    <span>Fee Deduction:</span>
                    <span class="amount fee-amount">-{{ feeImpact.feeAmount | currency:'INR':'symbol':'1.2-2' }}</span>
                  </div>
                }
                <div class="summary-row total">
                  <span>Net Investment:</span>
                  <span class="amount">{{ feeImpact.netInvestment | currency:'INR':'symbol':'1.2-2' }}</span>
                </div>
                <div class="summary-row">
                  <span>Units to be Allocated:</span>
                  <span class="units">{{ feeImpact.unitsAllocated | number:'1.4-4' }}</span>
                </div>
              </div>

              <!-- Fee Details -->
              @if (feeImpact.activeFee) {
                <div class="impact-section">
                  <h4>Fee Details</h4>
                  <div class="fee-info">
                    <div class="fee-row">
                      <span>Active Fee:</span>
                      <span>{{ feeImpact.activeFee.totalFeeAmount | currency:'INR':'symbol':'1.2-2' }}</span>
                    </div>
                    <div class="fee-row">
                      <span>Fee Period:</span>
                      <span>{{ feeImpact.activeFee.fromDate | date }} - {{ feeImpact.activeFee.toDate | date }}</span>
                    </div>
                    <div class="fee-row">
                      <span>Remaining Days:</span>
                      <span>{{ feeImpact.activeFee.remainingDays }} days</span>
                    </div>
                    <div class="fee-row">
                      <span>Current Users:</span>
                      <span>{{ feeImpact.currentUserCount }}</span>
                    </div>
                  </div>
                </div>
              }

              <!-- Existing Users Impact -->
              @if (feeImpact.existingUsersImpact.length > 0) {
                <div class="impact-section">
                  <h4>Impact on Existing Users</h4>
                  <div class="existing-users-list">
                    @for (userImpact of feeImpact.existingUsersImpact; track userImpact.userId) {
                      <div class="user-impact">
                        <div class="user-name">{{ userImpact.userName }}</div>
                        @if (userImpact.creditAmount > 0) {
                          <div class="credit-amount">
                            Credit: +{{ userImpact.creditAmount | currency:'INR':'symbol':'1.2-2' }}
                            ({{ userImpact.creditUnits | number:'1.4-4' }} units)
                          </div>
                        }
                      </div>
                    }
                  </div>
                  <mat-hint class="credit-explanation">
                    Existing users will receive credits to ensure fair fee distribution
                  </mat-hint>
                </div>
              }

              <!-- No Fee Message -->
              @if (!feeImpact.activeFee) {
                <div class="impact-section">
                  <div class="no-fee-message">
                    <mat-icon color="primary">check_circle</mat-icon>
                    <span>No active fees - Full investment amount will be allocated</span>
                  </div>
                </div>
              }

            </mat-card-content>
          </mat-card>
        }

        <!-- Confirmation Checkbox -->
        @if (feeImpact && (feeImpact.feeAmount > 0 || feeImpact.existingUsersImpact.length > 0)) {
          <mat-checkbox formControlName="confirmFeeImpact"
                        class="confirmation-checkbox">
            I understand the fee impact and confirm this investment
          </mat-checkbox>
        }

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button
              color="primary"
              [disabled]="addUserForm.invalid || isSubmitting"
              (click)="addUserToPortfolio()">
        @if (isSubmitting) {
          <mat-spinner diameter="20"></mat-spinner>
          <span>Adding User...</span>
        } @else {
          <ng-container>
            <mat-icon>person_add</mat-icon>
            <span>Add User to Portfolio</span>
          </ng-container>
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .add-user-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-width: 500px;
      max-width: 600px;
    }

    .full-width {
      width: 100%;
    }

    .loading-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }

    .user-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 8px 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .user-name {
      font-weight: 500;
      font-size: 14px;
      color: #333;
    }

    .user-details {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }

    .user-role {
      margin-left: 12px;
    }

    .role-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      background: #e0e0e0;
      color: #666;
    }

    .role-badge.admin {
      background: #e3f2fd;
      color: #1976d2;
    }

    .selected-user-card {
      margin: 16px 0;
      border: 2px solid #e3f2fd;
      background: #f8f9fa;
    }

    .selected-user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
    }

    .user-details h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .user-details p {
      margin: 0 0 2px 0;
      font-size: 12px;
      color: #666;
    }

    .fee-impact-card {
      margin: 20px 0;
      border: 1px solid #e3f2fd;
    }

    .fee-impact-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
    }

    .impact-section {
      margin-bottom: 20px;
    }

    .impact-section:last-child {
      margin-bottom: 0;
    }

    .impact-section h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .summary-row.total {
      border-bottom: 2px solid #333;
      font-weight: 500;
    }

    .amount {
      font-weight: 500;
    }

    .fee-amount {
      color: #f44336;
    }

    .units {
      font-weight: 500;
      color: #1976d2;
    }

    .fee-info {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 8px;
    }

    .fee-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
    }

    .existing-users-list {
      background: #f9f9f9;
      padding: 12px;
      border-radius: 8px;
    }

    .user-impact {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .user-impact:last-child {
      border-bottom: none;
    }

    .user-name {
      font-weight: 500;
    }

    .credit-amount {
      color: #4caf50;
      font-size: 12px;
    }

    .credit-explanation {
      margin-top: 8px;
      font-size: 12px;
      color: #666;
    }

    .no-fee-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #e8f5e8;
      border-radius: 8px;
      color: #2e7d32;
    }

    .confirmation-checkbox {
      margin: 16px 0;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
    }

    mat-dialog-actions button {
      margin-left: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .datetime-container {
      display: flex;
      gap: 16px;
      margin-top: 16px;
    }

    .date-field {
      flex: 1;
    }

    .time-field {
      flex: 1;
    }

    // Fix dropdown z-index issues
    ::ng-deep .mat-mdc-select-panel {
      z-index: 10000 !important;
    }

    ::ng-deep .cdk-overlay-pane {
      z-index: 10000 !important;
    }

    @media (max-width: 600px) {
      .add-user-form {
        min-width: 300px;
      }

      .user-option {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .selected-user-info {
        flex-direction: column;
        text-align: center;
      }

      .summary-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .user-impact {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .datetime-container {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class AddUserToPortfolioDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddUserToPortfolioDialogComponent>);
  private userService = inject(UserService);
  private investmentService = inject(InvestmentService);
  private portfolioService = inject(PortfolioService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  // LocalStorage keys for datetime preferences
  private readonly DATETIME_STORAGE_KEY = 'addUserPortfolio_datetime_preferences';

  addUserForm: FormGroup;
  availableUsers: User[] = [];
  allUsers: User[] = [];
  selectedUser: User | null = null;
  feeImpact: FeeImpactPreview | null = null;
  isSubmitting = false;
  isLoadingUsers = false;
  existingInvestorIds: number[] = [];
  activeFee: PortfolioFee | null = null;
  portfolioNavValue = 10; // Default NAV value, should be loaded from portfolio details

  constructor(@Inject(MAT_DIALOG_DATA) public data: { portfolioId: number }) {
    // Load saved datetime preferences from localStorage
    const savedDatetime = this.loadDatetimePreferences();
    
    this.addUserForm = this.fb.group({
      userId: ['', Validators.required],
      investmentAmount: ['', [Validators.required, Validators.min(1)]],
      confirmFeeImpact: [false],
      transactionDate: [savedDatetime.date || ''],
      transactionTime: [savedDatetime.time || '']
    });
  }

  ngOnInit() {
    this.loadAvailableUsers();
    this.loadPortfolioFees();
    this.setupFormValidation();
  }

  loadAvailableUsers() {
    this.isLoadingUsers = true;

    // Load all active users with role filter
    this.userService.getUsers(true, 'USER').subscribe({
      next: (response) => {
        if (response.success) {
          this.allUsers = response.data || [];
          this.loadExistingInvestors();
        }
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        this.isLoadingUsers = false;
      }
    });
  }

  loadExistingInvestors() {
    // Get current portfolio investors to exclude them
    this.investmentService.getPortfolioInvestments(this.data.portfolioId).subscribe({
      next: (response) => {
        if (response.success) {
          this.existingInvestorIds = (response.data || []).map(inv => inv.user.id);
          this.filterAvailableUsers();
        }
      },
      error: (error) => {
        console.error('Failed to load existing investors:', error);
        this.filterAvailableUsers(); // Continue with all users if this fails
      }
    });
  }

  filterAvailableUsers() {
    // Filter out existing investors and ensure we have valid user data
    this.availableUsers = this.allUsers.filter(user =>
      user &&
      user.id &&
      user.firstName &&
      user.lastName &&
      user.email &&
      user.username &&
      !this.existingInvestorIds.includes(user.id)
    );
  }

  loadPortfolioFees() {
    // Load active portfolio fees to calculate fee impact
    this.portfolioService.getPortfolioFees(this.data.portfolioId, true).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          this.activeFee = response.data[0]; // Get the first active fee
        } else {
          this.activeFee = null;
        }
      },
      error: (error) => {
        console.error('Failed to load portfolio fees:', error);
        this.activeFee = null;
      }
    });
  }

  onUserSelected(event: any) {
    const selectedUserId = event.value;
    this.selectedUser = this.availableUsers.find(user => user.id === selectedUserId) || null;

    if (this.selectedUser) {
      this.calculateFeeImpact();
    } else {
      this.feeImpact = null;
    }
  }

  getUserInitials(user: User): string {
    if (!user || !user.firstName || !user.lastName) {
      return '??';
    }
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  calculateFeeImpact() {
    const userId = this.addUserForm.get('userId')?.value;
    const investmentAmount = this.addUserForm.get('investmentAmount')?.value;

    if (!userId || !investmentAmount || investmentAmount <= 0) {
      this.feeImpact = null;
      return;
    }

    // Calculate fee impact based on actual portfolio fees
    this.calculateActualFeeImpact(investmentAmount);
  }

  private calculateActualFeeImpact(investmentAmount: number) {
    const currentUserCount = this.existingInvestorIds.length;
    let feeAmount = 0;
    let existingUsersImpact: UserFeeImpact[] = [];

    // Calculate fee deduction if there's an active fee
    if (this.activeFee && this.activeFee.totalFeeAmount > 0) {
      // Calculate proportional fee based on remaining days and user count
      const totalUsers = currentUserCount + 1; // Including the new user
      const dailyFeePerUser = this.activeFee.dailyFeeAmount / totalUsers;
      feeAmount = dailyFeePerUser * this.activeFee.remainingDays;

      // Calculate credit for existing users (simplified calculation)
      if (currentUserCount > 0) {
        const creditPerUser = (this.activeFee.dailyFeeAmount / currentUserCount - dailyFeePerUser) * this.activeFee.remainingDays;
        if (creditPerUser > 0) {
          // This would normally come from the backend with actual user names
          existingUsersImpact = this.existingInvestorIds.map(userId => ({
            userId,
            userName: `User ${userId}`, // Placeholder - should get actual names
            creditAmount: creditPerUser,
            creditUnits: creditPerUser / this.portfolioNavValue
          }));
        }
      }
    }

    const netInvestment = investmentAmount - feeAmount;
    const unitsAllocated = netInvestment / this.portfolioNavValue;

    this.feeImpact = {
      feeAmount,
      netInvestment,
      unitsAllocated,
      activeFee: this.activeFee,
      currentUserCount,
      existingUsersImpact
    };

    this.updateConfirmationRequirement();
  }

  private updateConfirmationRequirement() {
    const confirmControl = this.addUserForm.get('confirmFeeImpact');

    if (this.feeImpact && (this.feeImpact.feeAmount > 0 || this.feeImpact.existingUsersImpact.length > 0)) {
      confirmControl?.setValidators([Validators.requiredTrue]);
    } else {
      confirmControl?.clearValidators();
      confirmControl?.setValue(true); // Auto-confirm when no fee impact
    }

    confirmControl?.updateValueAndValidity();
  }

  private setupFormValidation() {
    // Watch for investment amount changes
    this.addUserForm.get('investmentAmount')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.calculateFeeImpact();
    });

    // Watch for datetime changes and save to localStorage
    this.addUserForm.get('transactionDate')?.valueChanges.subscribe(() => {
      this.saveDatetimePreferences();
    });

    this.addUserForm.get('transactionTime')?.valueChanges.subscribe(() => {
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
      const dateValue = this.addUserForm.get('transactionDate')?.value;
      const timeValue = this.addUserForm.get('transactionTime')?.value;
      
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
    const dateValue = this.addUserForm.get('transactionDate')?.value;
    const timeValue = this.addUserForm.get('transactionTime')?.value;

    if (!dateValue && !timeValue) {
      return undefined; // No date or time specified, use current datetime
    }

    if (dateValue && !timeValue) {
      // Date specified, use current time
      const now = new Date();
      const combinedDate = new Date(dateValue);
      combinedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      return combinedDate;
    }

    if (!dateValue && timeValue) {
      // Time specified, use current date
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

  addUserToPortfolio() {
    if (this.addUserForm.invalid || !this.selectedUser) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    const userId = this.addUserForm.get('userId')?.value;
    const investmentAmount = this.addUserForm.get('investmentAmount')?.value;
    const adminUserId = this.authService.getCurrentUser()?.id || 1;
    const transactionDate = this.combineDateTime();

    this.investmentService.investInPortfolio(
      this.data.portfolioId,
      userId,
      investmentAmount,
      adminUserId,
      transactionDate
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(
            `Successfully added ${this.selectedUser?.firstName} ${this.selectedUser?.lastName} to portfolio`,
            'Close',
            { duration: 5000, panelClass: ['success-snackbar'] }
          );
          this.dialogRef.close(response.data);
        } else {
          this.snackBar.open(response.message || 'Failed to add user to portfolio', 'Close', { duration: 5000 });
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Failed to add user to portfolio:', error);
        this.snackBar.open(error.error?.message || 'Failed to add user to portfolio', 'Close', { duration: 5000 });
        this.isSubmitting = false;
      }
    });
  }
}
