import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';

import { PortfolioService } from '../../core/services/portfolio.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

interface CreatePortfolioRequest {
  name: string;
  description: string;
  initialNavValue: number;
  initialCash: number;
  managementFeePercentage: number;
  entryLoadPercentage: number;
  exitLoadPercentage: number;
  brokerageBuyPercentage: number;
  brokerageSellPercentage: number;
  initialInvestors: {
    userId: number;
    investmentAmount: number;
  }[];
}

@Component({
  selector: 'app-portfolio-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatStepperModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatDividerModule
  ],
  template: `
    <div class="create-portfolio-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>add_circle</mat-icon>
            Create New Portfolio
          </mat-card-title>
          <mat-card-subtitle>Set up a new mutual fund portfolio with initial configuration</mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <mat-stepper [linear]="true" #stepper class="portfolio-stepper">
        <!-- Step 1: Basic Information -->
        <mat-step [stepControl]="basicInfoForm" label="Basic Information">
          <form [formGroup]="basicInfoForm" class="step-form">
            <mat-card>
              <mat-card-content>
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Portfolio Name</mat-label>
                    <input matInput formControlName="name" placeholder="Enter portfolio name">
                    <mat-icon matSuffix>business_center</mat-icon>
                    @if (basicInfoForm.get('name')?.hasError('required') && basicInfoForm.get('name')?.touched) {
                      <mat-error>Portfolio name is required</mat-error>
                    }
                    @if (basicInfoForm.get('name')?.hasError('minlength')) {
                      <mat-error>Portfolio name must be at least 3 characters</mat-error>
                    }
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" rows="3" placeholder="Describe the portfolio strategy and objectives"></textarea>
                    <mat-icon matSuffix>description</mat-icon>
                    @if (basicInfoForm.get('description')?.hasError('maxlength')) {
                      <mat-error>Description cannot exceed 500 characters</mat-error>
                    }
                  </mat-form-field>
                </div>

                <div class="form-row two-columns">
                  <mat-form-field appearance="outline">
                    <mat-label>Initial NAV Value</mat-label>
                    <input matInput type="number" formControlName="initialNavValue" placeholder="10.0000">
                    <span matTextPrefix>₹</span>
                    @if (basicInfoForm.get('initialNavValue')?.hasError('required') && basicInfoForm.get('initialNavValue')?.touched) {
                      <mat-error>Initial NAV is required</mat-error>
                    }
                    @if (basicInfoForm.get('initialNavValue')?.hasError('min')) {
                      <mat-error>NAV must be greater than 0</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Initial Cash</mat-label>
                    <input matInput type="number" formControlName="initialCash" placeholder="100000">
                    <span matTextPrefix>₹</span>
                    @if (basicInfoForm.get('initialCash')?.hasError('required') && basicInfoForm.get('initialCash')?.touched) {
                      <mat-error>Initial cash is required</mat-error>
                    }
                    @if (basicInfoForm.get('initialCash')?.hasError('min')) {
                      <mat-error>Initial cash must be greater than 0</mat-error>
                    }
                  </mat-form-field>
                </div>
              </mat-card-content>
            </mat-card>

            <div class="step-actions">
              <button mat-raised-button color="primary" matStepperNext [disabled]="basicInfoForm.invalid">
                Next
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 2: Fee Structure -->
        <mat-step [stepControl]="feeStructureForm" label="Fee Structure">
          <form [formGroup]="feeStructureForm" class="step-form">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Configure Fee Structure</mat-card-title>
                <mat-card-subtitle>Set up management fees and charges</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="form-row two-columns">
                  <mat-form-field appearance="outline">
                    <mat-label>Management Fee</mat-label>
                    <input matInput type="number" formControlName="managementFeePercentage" placeholder="2.00">
                    <span matTextSuffix>%</span>
                    @if (feeStructureForm.get('managementFeePercentage')?.hasError('required') && feeStructureForm.get('managementFeePercentage')?.touched) {
                      <mat-error>Management fee is required</mat-error>
                    }
                    @if (feeStructureForm.get('managementFeePercentage')?.hasError('min') || feeStructureForm.get('managementFeePercentage')?.hasError('max')) {
                      <mat-error>Fee must be between 0% and 10%</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Entry Load</mat-label>
                    <input matInput type="number" formControlName="entryLoadPercentage" placeholder="1.00">
                    <span matTextSuffix>%</span>
                    @if (feeStructureForm.get('entryLoadPercentage')?.hasError('required') && feeStructureForm.get('entryLoadPercentage')?.touched) {
                      <mat-error>Entry load is required</mat-error>
                    }
                    @if (feeStructureForm.get('entryLoadPercentage')?.hasError('min') || feeStructureForm.get('entryLoadPercentage')?.hasError('max')) {
                      <mat-error>Fee must be between 0% and 5%</mat-error>
                    }
                  </mat-form-field>
                </div>

                <div class="form-row two-columns">
                  <mat-form-field appearance="outline">
                    <mat-label>Exit Load</mat-label>
                    <input matInput type="number" formControlName="exitLoadPercentage" placeholder="0.50">
                    <span matTextSuffix>%</span>
                    @if (feeStructureForm.get('exitLoadPercentage')?.hasError('required') && feeStructureForm.get('exitLoadPercentage')?.touched) {
                      <mat-error>Exit load is required</mat-error>
                    }
                    @if (feeStructureForm.get('exitLoadPercentage')?.hasError('min') || feeStructureForm.get('exitLoadPercentage')?.hasError('max')) {
                      <mat-error>Fee must be between 0% and 5%</mat-error>
                    }
                  </mat-form-field>

                  <div class="fee-info">
                    <mat-icon>info</mat-icon>
                    <span>Exit load applies to withdrawals within 1 year</span>
                  </div>
                </div>

                <div class="form-row two-columns">
                  <mat-form-field appearance="outline">
                    <mat-label>Brokerage (Buy)</mat-label>
                    <input matInput type="number" formControlName="brokerageBuyPercentage" placeholder="0.25">
                    <span matTextSuffix>%</span>
                    @if (feeStructureForm.get('brokerageBuyPercentage')?.hasError('required') && feeStructureForm.get('brokerageBuyPercentage')?.touched) {
                      <mat-error>Buy brokerage is required</mat-error>
                    }
                    @if (feeStructureForm.get('brokerageBuyPercentage')?.hasError('min') || feeStructureForm.get('brokerageBuyPercentage')?.hasError('max')) {
                      <mat-error>Fee must be between 0% and 2%</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Brokerage (Sell)</mat-label>
                    <input matInput type="number" formControlName="brokerageSellPercentage" placeholder="0.25">
                    <span matTextSuffix>%</span>
                    @if (feeStructureForm.get('brokerageSellPercentage')?.hasError('required') && feeStructureForm.get('brokerageSellPercentage')?.touched) {
                      <mat-error>Sell brokerage is required</mat-error>
                    }
                    @if (feeStructureForm.get('brokerageSellPercentage')?.hasError('min') || feeStructureForm.get('brokerageSellPercentage')?.hasError('max')) {
                      <mat-error>Fee must be between 0% and 2%</mat-error>
                    }
                  </mat-form-field>
                </div>

                <div class="fee-summary">
                  <h4>Fee Summary</h4>
                  <div class="summary-grid">
                    <div class="summary-item">
                      <span class="label">Annual Management Fee:</span>
                      <span class="value">{{ feeStructureForm.get('managementFeePercentage')?.value || 0 }}%</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Entry Load:</span>
                      <span class="value">{{ feeStructureForm.get('entryLoadPercentage')?.value || 0 }}%</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Exit Load:</span>
                      <span class="value">{{ feeStructureForm.get('exitLoadPercentage')?.value || 0 }}%</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Trading Brokerage:</span>
                      <span class="value">{{ feeStructureForm.get('brokerageBuyPercentage')?.value || 0 }}% / {{ feeStructureForm.get('brokerageSellPercentage')?.value || 0 }}%</span>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <div class="step-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Back
              </button>
              <button mat-raised-button color="primary" matStepperNext [disabled]="feeStructureForm.invalid">
                Next
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 3: Initial Investors -->
        <mat-step [stepControl]="investorsForm" label="Initial Investors">
          <form [formGroup]="investorsForm" class="step-form">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Add Initial Investors</mat-card-title>
                <mat-card-subtitle>Select users and their initial investment amounts</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                @if (isLoadingUsers) {
                  <div class="loading-users">
                    <mat-spinner diameter="30"></mat-spinner>
                    <span>Loading users...</span>
                  </div>
                } @else {
                  <div class="add-investor-section">
                    <div class="form-row two-columns">
                      <mat-form-field appearance="outline">
                        <mat-label>Select User</mat-label>
                        <mat-select [(value)]="selectedUserId">
                          @for (user of availableUsers; track user.id) {
                            <mat-option [value]="user.id">
                              {{ user.firstName }} {{ user.lastName }} ({{ user.username }})
                            </mat-option>
                          }
                        </mat-select>
                        <mat-icon matSuffix>person</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Investment Amount</mat-label>
                        <input matInput type="number" [(ngModel)]="investmentAmount" placeholder="10000">
                        <span matTextPrefix>₹</span>
                      </mat-form-field>
                    </div>

                    <button mat-raised-button color="accent" (click)="addInvestor()"
                            [disabled]="!selectedUserId || !investmentAmount || investmentAmount <= 0">
                      <mat-icon>add</mat-icon>
                      Add Investor
                    </button>
                  </div>

                  <mat-divider></mat-divider>

                  @if (initialInvestors.length > 0) {
                    <div class="investors-list">
                      <h4>Initial Investors ({{ initialInvestors.length }})</h4>
                      <div class="investors-table">
                        <table mat-table [dataSource]="initialInvestors" class="full-width">
                          <ng-container matColumnDef="name">
                            <th mat-header-cell *matHeaderCellDef>Investor</th>
                            <td mat-cell *matCellDef="let investor">
                              {{ investor.user.firstName }} {{ investor.user.lastName }}
                            </td>
                          </ng-container>

                          <ng-container matColumnDef="username">
                            <th mat-header-cell *matHeaderCellDef>Username</th>
                            <td mat-cell *matCellDef="let investor">{{ investor.user.username }}</td>
                          </ng-container>

                          <ng-container matColumnDef="amount">
                            <th mat-header-cell *matHeaderCellDef>Investment Amount</th>
                            <td mat-cell *matCellDef="let investor">
                              {{ investor.investmentAmount | currency:'INR':'symbol':'1.2-2' }}
                            </td>
                          </ng-container>

                          <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef>Actions</th>
                            <td mat-cell *matCellDef="let investor; let i = index">
                              <button mat-icon-button color="warn" (click)="removeInvestor(i)">
                                <mat-icon>delete</mat-icon>
                              </button>
                            </td>
                          </ng-container>

                          <tr mat-header-row *matHeaderRowDef="investorColumns"></tr>
                          <tr mat-row *matRowDef="let row; columns: investorColumns;"></tr>
                        </table>
                      </div>

                      <div class="investment-summary">
                        <div class="summary-card">
                          <mat-icon>account_balance_wallet</mat-icon>
                          <div class="summary-info">
                            <span class="label">Total Initial Investment</span>
                            <span class="value">{{ getTotalInvestment() | currency:'INR':'symbol':'1.2-2' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  } @else {
                    <div class="no-investors">
                      <mat-icon>people_outline</mat-icon>
                      <p>No investors added yet</p>
                      <small>Add at least one initial investor to continue</small>
                    </div>
                  }
                }
              </mat-card-content>
            </mat-card>

            <div class="step-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Back
              </button>
              <button mat-raised-button color="primary" matStepperNext [disabled]="initialInvestors.length === 0">
                Next
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 4: Review & Create -->
        <mat-step label="Review & Create">
          <div class="step-form">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Review Portfolio Details</mat-card-title>
                <mat-card-subtitle>Please review all information before creating the portfolio</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="review-section">
                  <h4>Basic Information</h4>
                  <div class="review-grid">
                    <div class="review-item">
                      <span class="label">Portfolio Name:</span>
                      <span class="value">{{ basicInfoForm.get('name')?.value }}</span>
                    </div>
                    <div class="review-item">
                      <span class="label">Description:</span>
                      <span class="value">{{ basicInfoForm.get('description')?.value || 'No description' }}</span>
                    </div>
                    <div class="review-item">
                      <span class="label">Initial NAV:</span>
                      <span class="value">₹{{ basicInfoForm.get('initialNavValue')?.value }}</span>
                    </div>
                    <div class="review-item">
                      <span class="label">Initial Cash:</span>
                      <span class="value">{{ basicInfoForm.get('initialCash')?.value | currency:'INR':'symbol':'1.2-2' }}</span>
                    </div>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="review-section">
                  <h4>Fee Structure</h4>
                  <div class="review-grid">
                    <div class="review-item">
                      <span class="label">Management Fee:</span>
                      <span class="value">{{ feeStructureForm.get('managementFeePercentage')?.value }}% annually</span>
                    </div>
                    <div class="review-item">
                      <span class="label">Entry Load:</span>
                      <span class="value">{{ feeStructureForm.get('entryLoadPercentage')?.value }}%</span>
                    </div>
                    <div class="review-item">
                      <span class="label">Exit Load:</span>
                      <span class="value">{{ feeStructureForm.get('exitLoadPercentage')?.value }}%</span>
                    </div>
                    <div class="review-item">
                      <span class="label">Brokerage:</span>
                      <span class="value">{{ feeStructureForm.get('brokerageBuyPercentage')?.value }}% / {{ feeStructureForm.get('brokerageSellPercentage')?.value }}%</span>
                    </div>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="review-section">
                  <h4>Initial Investors ({{ initialInvestors.length }})</h4>
                  <div class="investors-summary">
                    @for (investor of initialInvestors; track investor.userId) {
                      <div class="investor-card">
                        <div class="investor-info">
                          <span class="name">{{ investor.user.firstName }} {{ investor.user.lastName }}</span>
                          <span class="username">{{ investor.user.username }}</span>
                        </div>
                        <span class="amount">{{ investor.investmentAmount | currency:'INR':'symbol':'1.2-2' }}</span>
                      </div>
                    }
                    <div class="total-investment">
                      <strong>Total: {{ getTotalInvestment() | currency:'INR':'symbol':'1.2-2' }}</strong>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <div class="step-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Back
              </button>
              <button mat-raised-button color="primary" (click)="createPortfolio()" [disabled]="isCreating">
                @if (isCreating) {
                  <mat-spinner diameter="20"></mat-spinner>
                  <span>Creating...</span>
                } @else {
                  <mat-icon>check</mat-icon>
                  <span>Create Portfolio</span>
                }
              </button>
            </div>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .create-portfolio-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }

    .header-card {
      margin-bottom: 20px;
    }

    .header-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
    }

    .portfolio-stepper {
      background: transparent;
    }

    .step-form {
      margin-top: 20px;
    }

    .form-row {
      margin-bottom: 20px;
    }

    .form-row.two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .full-width {
      width: 100%;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding: 20px 0;
    }

    .step-actions button {
      min-width: 120px;
    }

    .fee-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
      margin-top: 16px;
    }

    .fee-summary {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .fee-summary h4 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .summary-item .label {
      color: #666;
      font-size: 14px;
    }

    .summary-item .value {
      font-weight: 600;
      color: #1976d2;
    }

    .add-investor-section {
      margin-bottom: 30px;
    }

    .loading-users {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 40px;
      color: #666;
    }

    .investors-list {
      margin-top: 30px;
    }

    .investors-list h4 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .investors-table {
      margin-bottom: 20px;
    }

    .investment-summary {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 24px;
      background: #e3f2fd;
      border-radius: 8px;
      border: 1px solid #bbdefb;
    }

    .summary-card mat-icon {
      color: #1976d2;
      font-size: 24px;
    }

    .summary-info {
      display: flex;
      flex-direction: column;
    }

    .summary-info .label {
      font-size: 14px;
      color: #666;
    }

    .summary-info .value {
      font-size: 18px;
      font-weight: 600;
      color: #1976d2;
    }

    .no-investors {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      color: #666;
      text-align: center;
    }

    .no-investors mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .review-section {
      margin-bottom: 30px;
    }

    .review-section h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
    }

    .review-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .review-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .review-item .label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .review-item .value {
      font-size: 16px;
      color: #333;
    }

    .investors-summary {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .investor-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .investor-info {
      display: flex;
      flex-direction: column;
    }

    .investor-info .name {
      font-weight: 500;
      color: #333;
    }

    .investor-info .username {
      font-size: 14px;
      color: #666;
    }

    .investor-card .amount {
      font-weight: 600;
      color: #1976d2;
    }

    .total-investment {
      text-align: right;
      padding: 12px 16px;
      background: #e3f2fd;
      border-radius: 8px;
      color: #1976d2;
    }

    @media (max-width: 768px) {
      .create-portfolio-container {
        padding: 16px;
      }

      .form-row.two-columns {
        grid-template-columns: 1fr;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .review-grid {
        grid-template-columns: 1fr;
      }

      .step-actions {
        flex-direction: column;
        gap: 12px;
      }

      .step-actions button {
        width: 100%;
      }
    }
  `]
})
export class PortfolioCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private portfolioService = inject(PortfolioService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  basicInfoForm: FormGroup;
  feeStructureForm: FormGroup;
  investorsForm: FormGroup;

  availableUsers: User[] = [];
  initialInvestors: { userId: number; investmentAmount: number; user: User }[] = [];
  selectedUserId: number | null = null;
  investmentAmount: number | null = null;

  isLoadingUsers = false;
  isCreating = false;

  investorColumns = ['name', 'username', 'amount', 'actions'];

  constructor() {
    this.basicInfoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      initialNavValue: [10.0000, [Validators.required, Validators.min(0.0001)]],
      initialCash: [100000, [Validators.required, Validators.min(1)]]
    });

    this.feeStructureForm = this.fb.group({
      managementFeePercentage: [2.00, [Validators.required, Validators.min(0), Validators.max(10)]],
      entryLoadPercentage: [1.00, [Validators.required, Validators.min(0), Validators.max(5)]],
      exitLoadPercentage: [0.50, [Validators.required, Validators.min(0), Validators.max(5)]],
      brokerageBuyPercentage: [0.25, [Validators.required, Validators.min(0), Validators.max(2)]],
      brokerageSellPercentage: [0.25, [Validators.required, Validators.min(0), Validators.max(2)]]
    });

    this.investorsForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.userService.getUsers({ activeOnly: true, role: 'USER' }).subscribe({
      next: (response) => {
        if (response.success) {
          this.availableUsers = response.data || [];
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

  addInvestor(): void {
    if (!this.selectedUserId || !this.investmentAmount || this.investmentAmount <= 0) {
      return;
    }

    // Check if user is already added
    if (this.initialInvestors.some(inv => inv.userId === this.selectedUserId)) {
      this.snackBar.open('User is already added as an investor', 'Close', { duration: 3000 });
      return;
    }

    const user = this.availableUsers.find(u => u.id === this.selectedUserId);
    if (!user) {
      return;
    }

    this.initialInvestors.push({
      userId: this.selectedUserId,
      investmentAmount: this.investmentAmount,
      user: user
    });

    // Reset selection
    this.selectedUserId = null;
    this.investmentAmount = null;

    this.snackBar.open('Investor added successfully', 'Close', { duration: 2000 });
  }

  removeInvestor(index: number): void {
    this.initialInvestors.splice(index, 1);
    this.snackBar.open('Investor removed', 'Close', { duration: 2000 });
  }

  getTotalInvestment(): number {
    return this.initialInvestors.reduce((total, inv) => total + inv.investmentAmount, 0);
  }

  createPortfolio(): void {
    if (this.basicInfoForm.invalid || this.feeStructureForm.invalid || this.initialInvestors.length === 0) {
      this.snackBar.open('Please complete all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isCreating = true;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      this.isCreating = false;
      return;
    }

    const portfolioData: CreatePortfolioRequest = {
      ...this.basicInfoForm.value,
      ...this.feeStructureForm.value,
      initialInvestors: this.initialInvestors.map(inv => ({
        userId: inv.userId,
        investmentAmount: inv.investmentAmount
      }))
    };

    this.portfolioService.createPortfolio(portfolioData, currentUser.id).subscribe({
      next: (response) => {
        this.isCreating = false;
        if (response.success) {
          this.snackBar.open('Portfolio created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/portfolios']);
        }
      },
      error: (error) => {
        this.isCreating = false;
        console.error('Failed to create portfolio:', error);
        this.snackBar.open(
          error.error?.message || 'Failed to create portfolio. Please try again.',
          'Close',
          { duration: 5000 }
        );
      }
    });
  }
}
