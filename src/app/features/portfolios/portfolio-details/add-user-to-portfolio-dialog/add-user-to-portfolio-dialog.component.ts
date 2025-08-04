import { Component, inject, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs';

import { UserService } from '../../../../core/services/user.service';
import { InvestmentService } from '../../../../core/services/investment.service';
import { PortfolioService } from '../../../../core/services/portfolio.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Investment } from '../../../../core/models/investment.model';

export interface AddUserToPortfolioForm {
  userId: number;
  investmentAmount: number;
  confirmFeeImpact: boolean;
}

export interface FeeImpactPreview {
  feeAmount: number;
  netInvestment: number;
  unitsAllocated: number;
  activeFee?: any;
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
    MatAutocompleteModule,
    MatCardModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Add User to Portfolio</h2>

    <mat-dialog-content>
      <form [formGroup]="addUserForm" class="add-user-form">

        <!-- User Selection -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Select User</mat-label>
          <input matInput
                 placeholder="Search by name, email, or username"
                 [matAutocomplete]="userAutocomplete"
                 formControlName="userSearch"
                 (input)="onUserSearch($event)"
                 required>
          <mat-autocomplete #userAutocomplete="matAutocomplete"
                            [displayWith]="displayUser"
                            (optionSelected)="onUserSelected($event)">
            @for (user of filteredUsers; track user.id) {
              <mat-option [value]="user">
                <div class="user-option">
                  <div class="user-info">
                    <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                    <span class="user-email">{{ user.email }}</span>
                    <span class="user-username">@{{ user.username }}</span>
                  </div>
                  <div class="user-role">
                    <span class="role-badge" [class.admin]="user.role === 'ADMIN'">
                      {{ user.role }}
                    </span>
                  </div>
                </div>
              </mat-option>
            }
            @if (filteredUsers.length === 0 && !isLoadingUsers) {
              <mat-option disabled>
                No available users found
              </mat-option>
            }
            @if (isLoadingUsers) {
              <mat-option disabled>
                <mat-spinner diameter="20"></mat-spinner>
                Searching users...
              </mat-option>
            }
          </mat-autocomplete>
          <mat-error *ngIf="addUserForm.get('userSearch')?.hasError('required')">
            Please select a user
          </mat-error>
        </mat-form-field>

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
          <span matPrefix>$&nbsp;</span>
          <mat-hint>Minimum investment: $1</mat-hint>
          <mat-error *ngIf="addUserForm.get('investmentAmount')?.hasError('required')">
            Investment amount is required
          </mat-error>
          <mat-error *ngIf="addUserForm.get('investmentAmount')?.hasError('min')">
            Investment amount must be at least $1
          </mat-error>
        </mat-form-field>

        <!-- Fee Impact Preview -->
        @if (feeImpact && selectedUser) {
          <mat-card class="fee-impact-card">
            <mat-card-header>
              <mat-card-title>Investment Impact Preview</mat-card-title>
            </mat-card-header>
            <mat-card-content>

              <!-- Investment Summary -->
              <div class="impact-section">
                <h4>Investment Summary</h4>
                <div class="summary-row">
                  <span>Gross Investment:</span>
                  <span class="amount">{{ addUserForm.get('investmentAmount')?.value | currency }}</span>
                </div>
                @if (feeImpact.feeAmount > 0) {
                  <div class="summary-row">
                    <span>Fee Deduction:</span>
                    <span class="amount fee-amount">-{{ feeImpact.feeAmount | currency }}</span>
                  </div>
                }
                <div class="summary-row total">
                  <span>Net Investment:</span>
                  <span class="amount">{{ feeImpact.netInvestment | currency }}</span>
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
                      <span>{{ feeImpact.activeFee.totalFeeAmount | currency }}</span>
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
                            Credit: +{{ userImpact.creditAmount | currency }}
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
        @if (feeImpact) {
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
        }
        Add User to Portfolio
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .add-user-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-width: 500px;
    }

    .full-width {
      width: 100%;
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
    }

    .user-email {
      font-size: 12px;
      color: #666;
    }

    .user-username {
      font-size: 12px;
      color: #999;
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

    .fee-impact-card {
      margin: 20px 0;
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

  addUserForm: FormGroup;
  filteredUsers: User[] = [];
  allUsers: User[] = [];
  selectedUser: User | null = null;
  feeImpact: FeeImpactPreview | null = null;
  isSubmitting = false;
  isLoadingUsers = false;
  existingInvestorIds: number[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { portfolioId: number }) {
    this.addUserForm = this.fb.group({
      userSearch: ['', Validators.required],
      userId: ['', Validators.required],
      investmentAmount: ['', [Validators.required, Validators.min(1)]],
      confirmFeeImpact: [false]
    });
  }

  ngOnInit() {
    this.loadAvailableUsers();
    this.setupFormValidation();
  }

  loadAvailableUsers() {
    this.isLoadingUsers = true;

    // Load all active users
    this.userService.getUsers(true).subscribe({
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

  filterAvailableUsers(searchTerm: string = '') {
    let availableUsers = this.allUsers.filter(user =>
      !this.existingInvestorIds.includes(user.id)
    );

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      availableUsers = availableUsers.filter(user =>
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term)
      );
    }

    this.filteredUsers = availableUsers;
  }

  onUserSearch(event: any) {
    const searchTerm = event.target.value;
    this.filterAvailableUsers(searchTerm);
  }

  onUserSelected(event: any) {
    this.selectedUser = event.option.value;
    this.addUserForm.patchValue({
      userId: this.selectedUser?.id,
      userSearch: this.displayUser(this.selectedUser)
    });
    this.calculateFeeImpact();
  }

  displayUser(user: User | null): string {
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  calculateFeeImpact() {
    const userId = this.addUserForm.get('userId')?.value;
    const investmentAmount = this.addUserForm.get('investmentAmount')?.value;

    if (!userId || !investmentAmount || investmentAmount <= 0) {
      this.feeImpact = null;
      return;
    }

    // Simplified fee impact calculation for preview
    // In a real implementation, this would call the backend for accurate calculation
    this.calculateSimplifiedFeeImpact(investmentAmount);
  }

  private calculateSimplifiedFeeImpact(investmentAmount: number) {
    // This is a simplified calculation for demonstration
    // In reality, you would call the backend API to get accurate fee calculations

    const mockActiveFee = null; // Assume no active fees for now
    const currentUserCount = this.existingInvestorIds.length;
    const feeAmount = 0; // No fees in this simplified version
    const netInvestment = investmentAmount - feeAmount;
    const mockNavValue = 10; // Default NAV value
    const unitsAllocated = netInvestment / mockNavValue;

    this.feeImpact = {
      feeAmount,
      netInvestment,
      unitsAllocated,
      activeFee: mockActiveFee,
      currentUserCount,
      existingUsersImpact: [] // No impact in simplified version
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
  }

  addUserToPortfolio() {
    if (this.addUserForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const userId = this.addUserForm.get('userId')?.value;
    const investmentAmount = this.addUserForm.get('investmentAmount')?.value;
    const adminUserId = this.authService.getCurrentUser()?.id || 1;

    this.investmentService.investInPortfolio(
      this.data.portfolioId,
      userId,
      investmentAmount,
      adminUserId
    ).subscribe({
      next: (response) => {
        if (response.success) {
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
