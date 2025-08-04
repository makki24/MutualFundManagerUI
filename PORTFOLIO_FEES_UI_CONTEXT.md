# Portfolio Fees Management - UI Context & Implementation Guide

## Overview

This document provides comprehensive instructions for implementing portfolio fees management in the UI. The system supports a simplified fee structure with fair distribution among users and automatic credit-back mechanisms.

## Simplified Fee Management Architecture

### Key Features
- **Single Fee Type**: Only one active fee per portfolio (no fee type categories)
- **Date-based Fees**: Fees are defined with fromDate and toDate periods
- **Fair Distribution**: Fees are distributed proportionally among users based on when they join
- **Automatic Credit-back**: When new users join, existing users get credited back to ensure fair sharing
- **Zero Fee Support**: Portfolios can have zero fees during creation

### Fee Structure Components
- **Portfolio Fees** (`PortfolioFee`) - Master fee records with total amounts and date periods
- **User Fee Allocations** (`UserFeeAllocation`) - Detailed fee distribution to individual users
- **Portfolio Charges** (`PortfolioCharge`) - Transaction-level charges (brokerage, etc.)

## Fee Distribution Logic

### Example Scenario (As per Requirements)
```
Portfolio Fee: 100rs for 10 days (Day 1 to Day 10)

Day 1: User1 invests 1000rs
- User1 pays: 100rs (full fee, only user)
- User1 gets: 900rs worth of units (1000 - 100)

Day 2: User2 invests 1000rs  
- Remaining days: 9 days
- Total users after investment: 2
- User2 pays: 50rs (100rs remaining / 2 users)
- User1 gets credited: 50rs worth of units (fair share adjustment)
- User2 gets: 950rs worth of units (1000 - 50)

Result: Both users effectively pay 50rs each for the remaining 9-day period
```

### Calculation Formula
```typescript
// For new user joining
const remainingDays = calculateRemainingDays(investmentDate, feeEndDate);
const totalUsersAfterInvestment = existingUsers + 1;
const newUserFee = (remainingFeeAmount / remainingDays / totalUsersAfterInvestment) * remainingDays;

// For existing users credit back
const fairSharePerUser = totalRemainingFeeAfterNewUser / totalUsersAfterInvestment;
const creditAmount = alreadyPaidForRemainingPeriod - fairSharePerUser;
```

## API Endpoints for Fee Management

### Portfolio Fee APIs
```
GET    /api/portfolios/{portfolioId}/fees                    - List portfolio fees
GET    /api/portfolios/{portfolioId}/fees/{feeId}           - Get specific fee details
POST   /api/portfolios/{portfolioId}/fees                   - Create new portfolio fee
PATCH  /api/portfolios/{portfolioId}/fees/{feeId}/deactivate - Deactivate fee
```

### Request/Response Models
```typescript
// Create Portfolio Fee Request
interface CreatePortfolioFeeRequest {
  totalFeeAmount: number;        // Required, min: 0 (can be zero)
  fromDate: Date;               // Required
  toDate: Date;                 // Required, must be >= fromDate
  description?: string;         // Optional
}

// Portfolio Fee Response
interface PortfolioFeeDto {
  id: number;
  portfolioId: number;
  portfolioName: string;
  totalFeeAmount: number;
  remainingFeeAmount: number;
  fromDate: Date;
  toDate: Date;
  isActive: boolean;
  description?: string;
  createdByUserId: number;
  createdByUserName: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Calculated fields
  totalDays: number;
  remainingDays: number;
  dailyFeeAmount: number;
  allocatedFeeAmount: number;
}
```

## UI Components Required

### 1. Portfolio Fees Dashboard
**Location**: Portfolio Details → Fees Tab

**Components**:
- **Fee Summary Cards**
  - Current Active Fee Amount
  - Daily Fee Rate
  - Remaining Days
  - Total Allocated Amount

- **Active Fee Display**
  - Fee amount and period
  - Progress bar showing allocation status
  - Remaining amount and days
  - Actions (View Details, Deactivate)

- **Fee History Table**
  - All fees (active and inactive)
  - Filterable by date range
  - Sortable by amount, date, status

### 2. Create Portfolio Fee Form
**Access**: Admin only, from Portfolio Fees Dashboard

**Form Fields**:
```typescript
interface CreatePortfolioFeeForm {
  totalFeeAmount: number;        // Required, min: 0, supports zero fees
  fromDate: Date;               // Required
  toDate: Date;                 // Required, must be >= fromDate
  description?: string;         // Optional
}
```

**Validation Rules**:
- Fee amount must be non-negative (zero allowed)
- To date must be after or equal to from date
- Only one active fee per portfolio allowed
- Date range cannot overlap with existing active fees

**UI Features**:
- Amount input with currency formatting
- Date range picker with validation
- Auto-calculation of daily fee rate
- Preview of fee impact on new investments

### 3. Fee Details Modal/Page
**Triggered**: Click on fee in fees table

**Information Displayed**:
- Fee basic information (amount, period, description)
- Fee allocation progress and status
- Daily fee breakdown and remaining days
- User-wise fee allocation details
- Fee transaction history

**Actions Available**:
- Deactivate fee (if active)
- View detailed allocation breakdown
- Export fee allocation report

### 4. Fee Allocation Tracking
**Access**: Admin only, from Fee Details

**Components**:
- **Allocation Summary**
  - Total allocated vs remaining amount
  - Number of users affected
  - Average fee per user
  - Allocation timeline

- **User Allocation Table**
  - User name and investment details
  - Allocated fee amount and date
  - Units adjusted for fees
  - Credit-back transactions (if any)

## UI Implementation Guidelines

### 1. Fee Dashboard Layout
```html
<!-- Fee Summary Section -->
<div class="fee-summary-section">
  <mat-card class="active-fee-card" *ngIf="activeFee">
    <mat-card-header>
      <mat-card-title>Active Portfolio Fee</mat-card-title>
      <mat-card-subtitle>{{ activeFee.fromDate | date }} - {{ activeFee.toDate | date }}</mat-card-subtitle>
    </mat-card-header>
    <mat-card-content>
      <div class="fee-amount-display">
        <span class="amount">₹{{ activeFee.totalFeeAmount | currency }}</span>
        <span class="daily-rate">₹{{ activeFee.dailyFeeAmount | currency }}/day</span>
      </div>
      
      <!-- Fee Progress Bar -->
      <mat-progress-bar 
        mode="determinate" 
        [value]="getFeeAllocationPercentage(activeFee)">
      </mat-progress-bar>
      
      <div class="fee-status">
        <span>Allocated: ₹{{ activeFee.allocatedFeeAmount | currency }}</span>
        <span>Remaining: ₹{{ activeFee.remainingFeeAmount | currency }}</span>
        <span>{{ activeFee.remainingDays }} days left</span>
      </div>
    </mat-card-content>
    <mat-card-actions>
      <button mat-button (click)="viewFeeDetails(activeFee)">View Details</button>
      <button mat-button color="warn" (click)="deactivateFee(activeFee)">Deactivate</button>
    </mat-card-actions>
  </mat-card>

  <!-- No Active Fee State -->
  <mat-card class="no-fee-card" *ngIf="!activeFee">
    <mat-card-content>
      <div class="no-fee-message">
        <mat-icon>money_off</mat-icon>
        <h3>No Active Fee</h3>
        <p>This portfolio currently has no active fees. You can create a fee to start charging users.</p>
      </div>
    </mat-card-content>
    <mat-card-actions>
      <button mat-raised-button color="primary" (click)="openCreateFeeDialog()">
        Create Portfolio Fee
      </button>
    </mat-card-actions>
  </mat-card>
</div>

<!-- Fee History Section -->
<mat-card class="fee-history-card">
  <mat-card-header>
    <mat-card-title>Fee History</mat-card-title>
    <button mat-raised-button color="primary" 
            [disabled]="activeFee" 
            (click)="openCreateFeeDialog()">
      Add New Fee
    </button>
  </mat-card-header>
  <mat-card-content>
    <table mat-table [dataSource]="allFees" class="fees-table">
      <!-- Amount Column -->
      <ng-container matColumnDef="amount">
        <th mat-header-cell *matHeaderCellDef>Amount</th>
        <td mat-cell *matCellDef="let fee">₹{{ fee.totalFeeAmount | currency }}</td>
      </ng-container>
      
      <!-- Period Column -->
      <ng-container matColumnDef="period">
        <th mat-header-cell *matHeaderCellDef>Period</th>
        <td mat-cell *matCellDef="let fee">
          {{ fee.fromDate | date:'dd/MM/yyyy' }} - {{ fee.toDate | date:'dd/MM/yyyy' }}
          <br>
          <small class="text-muted">{{ fee.totalDays }} days</small>
        </td>
      </ng-container>
      
      <!-- Status Column -->
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let fee">
          <mat-chip [color]="fee.isActive ? 'primary' : 'basic'">
            {{ fee.isActive ? 'Active' : 'Inactive' }}
          </mat-chip>
        </td>
      </ng-container>
      
      <!-- Progress Column -->
      <ng-container matColumnDef="progress">
        <th mat-header-cell *matHeaderCellDef>Allocation</th>
        <td mat-cell *matCellDef="let fee">
          <div class="allocation-progress">
            <mat-progress-bar 
              mode="determinate" 
              [value]="getFeeAllocationPercentage(fee)">
            </mat-progress-bar>
            <small>{{ getFeeAllocationPercentage(fee) }}% allocated</small>
          </div>
        </td>
      </ng-container>
      
      <!-- Actions Column -->
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let fee">
          <button mat-icon-button (click)="viewFeeDetails(fee)">
            <mat-icon>visibility</mat-icon>
          </button>
          <button mat-icon-button 
                  (click)="deactivateFee(fee)" 
                  [disabled]="!fee.isActive">
            <mat-icon>block</mat-icon>
          </button>
        </td>
      </ng-container>
    </table>
  </mat-card-content>
</mat-card>
```

### 2. Create Fee Dialog
```html
<h2 mat-dialog-title>Create Portfolio Fee</h2>

<mat-dialog-content>
  <form [formGroup]="createFeeForm" class="create-fee-form">
    <!-- Fee Amount -->
    <mat-form-field appearance="outline">
      <mat-label>Fee Amount</mat-label>
      <input matInput type="number" formControlName="totalFeeAmount" 
             placeholder="0.00" min="0" step="0.01" required>
      <span matPrefix>₹&nbsp;</span>
      <mat-hint>Enter 0 for no fees</mat-hint>
      <mat-error *ngIf="createFeeForm.get('totalFeeAmount')?.hasError('required')">
        Fee amount is required
      </mat-error>
      <mat-error *ngIf="createFeeForm.get('totalFeeAmount')?.hasError('min')">
        Fee amount must be non-negative
      </mat-error>
    </mat-form-field>

    <!-- Date Range -->
    <div class="date-range-container">
      <mat-form-field appearance="outline">
        <mat-label>From Date</mat-label>
        <input matInput [matDatepicker]="fromDatePicker" 
               formControlName="fromDate" required>
        <mat-datepicker-toggle matSuffix [for]="fromDatePicker"></mat-datepicker-toggle>
        <mat-datepicker #fromDatePicker></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>To Date</mat-label>
        <input matInput [matDatepicker]="toDatePicker" 
               formControlName="toDate" required>
        <mat-datepicker-toggle matSuffix [for]="toDatePicker"></mat-datepicker-toggle>
        <mat-datepicker #toDatePicker></mat-datepicker>
      </mat-form-field>
    </div>

    <!-- Description -->
    <mat-form-field appearance="outline">
      <mat-label>Description (Optional)</mat-label>
      <textarea matInput formControlName="description" 
                placeholder="Enter fee description..." rows="3"></textarea>
    </mat-form-field>

    <!-- Fee Calculation Preview -->
    <mat-card class="fee-preview-card" *ngIf="feePreview">
      <mat-card-header>
        <mat-card-title>Fee Calculation Preview</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="preview-row">
          <span>Total Period:</span>
          <span>{{ feePreview.totalDays }} days</span>
        </div>
        <div class="preview-row">
          <span>Daily Fee Rate:</span>
          <span>₹{{ feePreview.dailyRate | currency }}</span>
        </div>
        <div class="preview-row" *ngIf="feePreview.totalFeeAmount > 0">
          <span>Impact on New Investment:</span>
          <span>₹{{ feePreview.dailyRate | currency }} per day per user</span>
        </div>
        <div class="preview-row" *ngIf="feePreview.totalFeeAmount === 0">
          <span>Fee Impact:</span>
          <span class="no-fee-text">No fees will be charged</span>
        </div>
      </mat-card-content>
    </mat-card>
  </form>
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-button mat-dialog-close>Cancel</button>
  <button mat-raised-button color="primary" 
          [disabled]="createFeeForm.invalid || isSubmitting"
          (click)="createFee()">
    <mat-spinner diameter="20" *ngIf="isSubmitting"></mat-spinner>
    Create Fee
  </button>
</mat-dialog-actions>
```

### 3. TypeScript Component Structure
```typescript
// Portfolio Fees Component
export interface PortfolioFee {
  id: number;
  portfolioId: number;
  portfolioName: string;
  totalFeeAmount: number;
  remainingFeeAmount: number;
  fromDate: Date;
  toDate: Date;
  isActive: boolean;
  description?: string;
  createdByUserId: number;
  createdByUserName: string;
  createdAt: Date;
  updatedAt: Date;
  totalDays: number;
  remainingDays: number;
  dailyFeeAmount: number;
  allocatedFeeAmount: number;
}

@Component({
  selector: 'app-portfolio-fees',
  templateUrl: './portfolio-fees.component.html',
  styleUrls: ['./portfolio-fees.component.scss']
})
export class PortfolioFeesComponent implements OnInit {
  portfolioId: number;
  activeFee: PortfolioFee | null = null;
  allFees: PortfolioFee[] = [];
  displayedColumns = ['amount', 'period', 'status', 'progress', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private portfolioFeeService: PortfolioFeeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.portfolioId = +this.route.snapshot.paramMap.get('id')!;
    this.loadPortfolioFees();
  }

  loadPortfolioFees() {
    // Load active fees
    this.portfolioFeeService.getActivePortfolioFees(this.portfolioId)
      .subscribe(response => {
        this.activeFee = response.data.length > 0 ? response.data[0] : null;
      });

    // Load all fees for history
    this.portfolioFeeService.getPortfolioFees(this.portfolioId)
      .subscribe(response => {
        this.allFees = response.data;
      });
  }

  openCreateFeeDialog() {
    if (this.activeFee) {
      this.snackBar.open('Portfolio already has an active fee. Deactivate it first.', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(CreatePortfolioFeeDialogComponent, {
      width: '600px',
      data: { portfolioId: this.portfolioId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPortfolioFees();
        this.snackBar.open('Portfolio fee created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  viewFeeDetails(fee: PortfolioFee) {
    const dialogRef = this.dialog.open(FeeDetailsDialogComponent, {
      width: '800px',
      data: { fee }
    });
  }

  deactivateFee(fee: PortfolioFee) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Deactivate Fee',
        message: `Are you sure you want to deactivate this fee of ₹${fee.totalFeeAmount}?`,
        confirmText: 'Deactivate'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.portfolioFeeService.deactivatePortfolioFee(this.portfolioId, fee.id)
          .subscribe(() => {
            this.loadPortfolioFees();
            this.snackBar.open('Fee deactivated successfully', 'Close', { duration: 3000 });
          });
      }
    });
  }

  getFeeAllocationPercentage(fee: PortfolioFee): number {
    if (fee.totalFeeAmount === 0) return 100; // Zero fees are always 100% "allocated"
    return (fee.allocatedFeeAmount / fee.totalFeeAmount) * 100;
  }
}
```

### 4. Service Implementation
```typescript
@Injectable({
  providedIn: 'root'
})
export class PortfolioFeeService {
  private apiUrl = '/api/portfolios';

  constructor(private http: HttpClient) {}

  getPortfolioFees(portfolioId: number): Observable<ApiResponse<PortfolioFee[]>> {
    return this.http.get<ApiResponse<PortfolioFee[]>>(`${this.apiUrl}/${portfolioId}/fees`);
  }

  getActivePortfolioFees(portfolioId: number): Observable<ApiResponse<PortfolioFee[]>> {
    const params = { activeOnly: 'true' };
    return this.http.get<ApiResponse<PortfolioFee[]>>(`${this.apiUrl}/${portfolioId}/fees`, { params });
  }

  getPortfolioFeeById(portfolioId: number, feeId: number): Observable<ApiResponse<PortfolioFee>> {
    return this.http.get<ApiResponse<PortfolioFee>>(`${this.apiUrl}/${portfolioId}/fees/${feeId}`);
  }

  createPortfolioFee(portfolioId: number, request: CreatePortfolioFeeRequest, createdByUserId: number): Observable<ApiResponse<PortfolioFee>> {
    const params = { createdByUserId: createdByUserId.toString() };
    return this.http.post<ApiResponse<PortfolioFee>>(`${this.apiUrl}/${portfolioId}/fees`, request, { params });
  }

  deactivatePortfolioFee(portfolioId: number, feeId: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${portfolioId}/fees/${feeId}/deactivate`, {});
  }
}
```

## User Experience Guidelines

### 1. Fee Creation Workflow
1. **Access Control**: Only admin users can create fees
2. **Single Fee Rule**: Only one active fee per portfolio at any time
3. **Zero Fee Support**: Allow creation of zero-amount fees for no-fee periods
4. **Date Validation**: Ensure valid date ranges with clear error messages
5. **Preview**: Show fee calculation preview before creation
6. **Confirmation**: Confirm fee creation with impact summary

### 2. Fee Monitoring
1. **Dashboard View**: Clear overview of active fee status
2. **Progress Tracking**: Visual progress bars for fee allocation
3. **Real-time Updates**: Automatic updates when users invest
4. **Historical Data**: Access to past fees and their allocation history

### 3. Fee Allocation Transparency
1. **Fair Distribution**: Clear explanation of how fees are distributed
2. **Credit-back Visibility**: Show when users receive credit-backs
3. **Transaction History**: Detailed fee-related transaction records
4. **User Impact**: Show fee impact on individual user investments

## Error Handling

### Common Error Scenarios
1. **Multiple Active Fees**: Prevent creation of multiple active fees
2. **Invalid Date Range**: To date before from date
3. **Overlapping Periods**: Fee periods that overlap with existing fees
4. **Insufficient Permissions**: Non-admin trying to create fees
5. **Network Errors**: API connectivity issues

### Error Messages
```typescript
const ERROR_MESSAGES = {
  MULTIPLE_ACTIVE_FEES: 'Portfolio already has an active fee. Only one fee per portfolio is allowed.',
  INVALID_DATE_RANGE: 'To date must be after or equal to from date',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to manage portfolio fees',
  INVALID_AMOUNT: 'Fee amount must be a non-negative number',
  NETWORK_ERROR: 'Unable to connect to server. Please try again.',
  FEE_NOT_FOUND: 'The requested fee could not be found',
  DEACTIVATION_FAILED: 'Unable to deactivate fee. Please try again.'
};
```

## Integration Points

### 1. Portfolio Dashboard Integration
- Add "Fees" tab to portfolio details
- Show fee summary in portfolio overview
- Include fee impact in investment calculations

### 2. User Investment Integration
- Show fee charges during investment process
- Include fees in transaction confirmations
- Display fee impact on unit calculations

### 3. Reporting Integration
- Include fees in portfolio performance reports
- Generate fee allocation reports
- Export fee data for accounting

## Testing Scenarios

### 1. Fee Creation Tests
- Create fees with valid data (including zero amounts)
- Validate form field requirements
- Test date range validation
- Test single active fee rule

### 2. Fee Distribution Tests
- First user pays full fee
- Second user pays proportional amount
- Existing users receive credit-back
- Zero fee scenarios

### 3. Fee Management Tests
- View fee details and allocation
- Deactivate active fees
- Filter and sort fee history
- Test permission controls

This comprehensive guide provides all the necessary context for implementing a robust, user-friendly portfolio fees management system in the UI. The implementation focuses on simplicity, fairness, and transparency while maintaining full control over fee allocation and tracking.
