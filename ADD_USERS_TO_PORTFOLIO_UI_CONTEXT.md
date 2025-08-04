# Add Users to Portfolio - UI Context & Implementation Guide

## Overview

This document provides comprehensive instructions for implementing the "Add Users to Portfolio" functionality in the UI. The system handles user investments, automatic fee distribution, and maintains fair fee allocation among all portfolio users.

## Current System Architecture

### API Endpoint for Adding Users
```
POST /api/portfolios/{portfolioId}/users/{userId}/invest
Parameters:
- portfolioId: Long (path parameter)
- userId: Long (path parameter) 
- investmentAmount: BigDecimal (query parameter)
- adminUserId: Long (query parameter)
```

### Fee Distribution Logic (Automatic)
The fee distribution is **automatically handled by the API** when a user is added to a portfolio. No separate UI call is needed for fee distribution.

**How it works:**
1. User invests amount (e.g., 1000rs)
2. API automatically calculates fees based on active portfolio fees
3. API distributes fees fairly among all users (including credit-backs)
4. User gets units based on net investment amount (investment - fees)
5. All fee transactions are recorded automatically

### Example Fee Distribution Scenario
```
Portfolio: 100rs fee for 10 days (Day 1 to Day 10)

Day 1: User1 invests 1000rs
- Fee charged: 100rs (full fee, only user)
- Net investment: 900rs
- Units allocated: 900rs / NAV

Day 2: User2 invests 1000rs
- Fee charged: 50rs (fair share for remaining 9 days)
- Net investment: 950rs
- Units allocated: 950rs / NAV
- User1 gets credited: 50rs worth of units (automatic rebalancing)

Result: Both users effectively pay 50rs each for the remaining period
```

## UI Components Required

### 1. Add User to Portfolio Dialog/Modal
**Access**: Admin only, from Portfolio Details page

**Trigger**: "Add User" or "Add Investor" button in portfolio details

**Form Fields**:
```typescript
interface AddUserToPortfolioForm {
  userId: number;              // Required - User selection
  investmentAmount: number;    // Required - Investment amount
  confirmFeeImpact: boolean;   // Required - Confirmation checkbox
}
```

### 2. User Selection Component
**Type**: Searchable dropdown or autocomplete

**Features**:
- Search users by name, email, or username
- Display user details (name, email, current portfolios)
- Exclude users already in the portfolio
- Show user's investment history

### 3. Investment Amount Input
**Features**:
- Currency formatting
- Minimum amount validation
- Real-time fee calculation preview
- Net investment amount display

### 4. Fee Impact Preview
**Features**:
- Show current active fees
- Calculate fee impact for new user
- Show credit-back impact for existing users
- Display final unit allocation

### 5. Confirmation Summary
**Features**:
- Investment details summary
- Fee breakdown
- Final units to be allocated
- Impact on existing users

## UI Implementation

### 1. Add User Dialog Component
```html
<h2 mat-dialog-title>Add User to Portfolio</h2>

<mat-dialog-content>
  <form [formGroup]="addUserForm" class="add-user-form">
    
    <!-- User Selection -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Select User</mat-label>
      <input matInput
             placeholder="Search by name or email"
             [matAutocomplete]="userAutocomplete"
             formControlName="userId"
             (input)="searchUsers($event.target.value)"
             required>
      <mat-autocomplete #userAutocomplete="matAutocomplete" 
                        [displayWith]="displayUser">
        <mat-option *ngFor="let user of filteredUsers" [value]="user.id">
          <div class="user-option">
            <div class="user-info">
              <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
              <span class="user-email">{{ user.email }}</span>
            </div>
            <div class="user-stats" *ngIf="user.investmentStats">
              <small>{{ user.investmentStats.totalPortfolios }} portfolios</small>
            </div>
          </div>
        </mat-option>
        <mat-option *ngIf="filteredUsers.length === 0" disabled>
          No users found
        </mat-option>
      </mat-autocomplete>
      <mat-error *ngIf="addUserForm.get('userId')?.hasError('required')">
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
      <span matPrefix>₹&nbsp;</span>
      <mat-hint>Minimum investment: ₹1</mat-hint>
      <mat-error *ngIf="addUserForm.get('investmentAmount')?.hasError('required')">
        Investment amount is required
      </mat-error>
      <mat-error *ngIf="addUserForm.get('investmentAmount')?.hasError('min')">
        Investment amount must be at least ₹1
      </mat-error>
    </mat-form-field>

    <!-- Fee Impact Preview -->
    <mat-card class="fee-impact-card" *ngIf="feeImpact && selectedUser">
      <mat-card-header>
        <mat-card-title>Investment Impact Preview</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        
        <!-- Investment Summary -->
        <div class="impact-section">
          <h4>Investment Summary</h4>
          <div class="summary-row">
            <span>Gross Investment:</span>
            <span class="amount">₹{{ addUserForm.get('investmentAmount')?.value | currency }}</span>
          </div>
          <div class="summary-row" *ngIf="feeImpact.feeAmount > 0">
            <span>Fee Deduction:</span>
            <span class="amount fee-amount">-₹{{ feeImpact.feeAmount | currency }}</span>
          </div>
          <div class="summary-row total">
            <span>Net Investment:</span>
            <span class="amount">₹{{ feeImpact.netInvestment | currency }}</span>
          </div>
          <div class="summary-row">
            <span>Units to be Allocated:</span>
            <span class="units">{{ feeImpact.unitsAllocated | number:'1.4-4' }}</span>
          </div>
        </div>

        <!-- Fee Details -->
        <div class="impact-section" *ngIf="feeImpact.activeFee">
          <h4>Fee Details</h4>
          <div class="fee-info">
            <div class="fee-row">
              <span>Active Fee:</span>
              <span>₹{{ feeImpact.activeFee.totalFeeAmount | currency }}</span>
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

        <!-- Existing Users Impact -->
        <div class="impact-section" *ngIf="feeImpact.existingUsersImpact.length > 0">
          <h4>Impact on Existing Users</h4>
          <div class="existing-users-list">
            <div class="user-impact" *ngFor="let userImpact of feeImpact.existingUsersImpact">
              <div class="user-name">{{ userImpact.userName }}</div>
              <div class="credit-amount" *ngIf="userImpact.creditAmount > 0">
                Credit: +₹{{ userImpact.creditAmount | currency }}
                ({{ userImpact.creditUnits | number:'1.4-4' }} units)
              </div>
            </div>
          </div>
          <mat-hint class="credit-explanation">
            Existing users will receive credits to ensure fair fee distribution
          </mat-hint>
        </div>

        <!-- No Fee Message -->
        <div class="impact-section" *ngIf="!feeImpact.activeFee">
          <div class="no-fee-message">
            <mat-icon color="primary">check_circle</mat-icon>
            <span>No active fees - Full investment amount will be allocated</span>
          </div>
        </div>

      </mat-card-content>
    </mat-card>

    <!-- Confirmation Checkbox -->
    <mat-checkbox formControlName="confirmFeeImpact" 
                  class="confirmation-checkbox"
                  *ngIf="feeImpact">
      I understand the fee impact and confirm this investment
    </mat-checkbox>

  </form>
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-button mat-dialog-close>Cancel</button>
  <button mat-raised-button 
          color="primary"
          [disabled]="addUserForm.invalid || isSubmitting"
          (click)="addUserToPortfolio()">
    <mat-spinner diameter="20" *ngIf="isSubmitting"></mat-spinner>
    Add User to Portfolio
  </button>
</mat-dialog-actions>
```

### 2. TypeScript Component Implementation
```typescript
export interface AddUserToPortfolioForm {
  userId: number;
  investmentAmount: number;
  confirmFeeImpact: boolean;
}

export interface FeeImpactPreview {
  feeAmount: number;
  netInvestment: number;
  unitsAllocated: number;
  activeFee?: PortfolioFee;
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
  templateUrl: './add-user-to-portfolio-dialog.component.html',
  styleUrls: ['./add-user-to-portfolio-dialog.component.scss']
})
export class AddUserToPortfolioDialogComponent implements OnInit {
  addUserForm: FormGroup;
  filteredUsers: UserDto[] = [];
  allUsers: UserDto[] = [];
  selectedUser: UserDto | null = null;
  feeImpact: FeeImpactPreview | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddUserToPortfolioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { portfolioId: number },
    private userService: UserService,
    private portfolioService: PortfolioService,
    private portfolioFeeService: PortfolioFeeService,
    private userInvestmentService: UserInvestmentService,
    private snackBar: MatSnackBar
  ) {
    this.addUserForm = this.fb.group({
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
    // Load all active users
    this.userService.getAllUsers(true).subscribe(response => {
      this.allUsers = response.data;
      this.filterAvailableUsers();
    });
  }

  filterAvailableUsers() {
    // Get current portfolio investors to exclude them
    this.userInvestmentService.getInvestmentsByPortfolioId(this.data.portfolioId, true)
      .subscribe(response => {
        const existingUserIds = response.data.map(inv => inv.user.id);
        this.filteredUsers = this.allUsers.filter(user => 
          !existingUserIds.includes(user.id)
        );
      });
  }

  searchUsers(searchTerm: string) {
    if (!searchTerm) {
      this.filterAvailableUsers();
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredUsers = this.allUsers.filter(user =>
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term)
    );
  }

  displayUser(userId: number): string {
    const user = this.allUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  calculateFeeImpact() {
    const userId = this.addUserForm.get('userId')?.value;
    const investmentAmount = this.addUserForm.get('investmentAmount')?.value;

    if (!userId || !investmentAmount || investmentAmount <= 0) {
      this.feeImpact = null;
      return;
    }

    this.selectedUser = this.allUsers.find(u => u.id === userId) || null;

    // Get active portfolio fees
    this.portfolioFeeService.getActivePortfolioFees(this.data.portfolioId)
      .subscribe(response => {
        const activeFees = response.data;
        const activeFee = activeFees.length > 0 ? activeFees[0] : null;

        // Get current portfolio investors
        this.userInvestmentService.getInvestmentsByPortfolioId(this.data.portfolioId, true)
          .subscribe(investmentResponse => {
            const currentInvestments = investmentResponse.data;
            
            this.calculateFeeImpactPreview(
              investmentAmount, 
              activeFee, 
              currentInvestments
            );
          });
      });
  }

  private calculateFeeImpactPreview(
    investmentAmount: number, 
    activeFee: PortfolioFee | null, 
    currentInvestments: UserInvestmentDto[]
  ) {
    let feeAmount = 0;
    let existingUsersImpact: UserFeeImpact[] = [];

    if (activeFee && activeFee.remainingDays > 0) {
      const currentUserCount = currentInvestments.length;
      const totalUsersAfterInvestment = currentUserCount + 1;
      
      // Calculate fee for new user (simplified calculation for preview)
      const dailyFeePerUser = activeFee.remainingFeeAmount / activeFee.remainingDays / totalUsersAfterInvestment;
      feeAmount = dailyFeePerUser * activeFee.remainingDays;

      // Calculate credit back for existing users (simplified)
      if (currentUserCount > 0) {
        const fairSharePerUser = activeFee.remainingFeeAmount / totalUsersAfterInvestment;
        
        existingUsersImpact = currentInvestments.map(investment => {
          // Simplified calculation - in reality this would be more complex
          const estimatedCreditAmount = feeAmount / totalUsersAfterInvestment;
          const creditUnits = estimatedCreditAmount / investment.portfolio.navValue;
          
          return {
            userId: investment.user.id,
            userName: `${investment.user.firstName} ${investment.user.lastName}`,
            creditAmount: estimatedCreditAmount,
            creditUnits: creditUnits
          };
        });
      }
    }

    const netInvestment = investmentAmount - feeAmount;
    const navValue = currentInvestments.length > 0 ? 
      currentInvestments[0].portfolio.navValue : 10; // Default NAV
    const unitsAllocated = netInvestment / navValue;

    this.feeImpact = {
      feeAmount,
      netInvestment,
      unitsAllocated,
      activeFee,
      currentUserCount: currentInvestments.length,
      existingUsersImpact
    };

    // Update form validation
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
    // Watch for user selection changes
    this.addUserForm.get('userId')?.valueChanges.subscribe(() => {
      this.calculateFeeImpact();
    });

    // Watch for investment amount changes
    this.addUserForm.get('investmentAmount')?.valueChanges.subscribe(() => {
      this.calculateFeeImpact();
    });
  }

  addUserToPortfolio() {
    if (this.addUserForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.addUserForm.value;

    this.portfolioService.addUserToPortfolio(
      this.data.portfolioId,
      formValue.userId,
      formValue.investmentAmount
    ).subscribe({
      next: (response) => {
        this.snackBar.open('User added to portfolio successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(response.data);
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to add user to portfolio', 'Close', { duration: 5000 });
        this.isSubmitting = false;
      }
    });
  }
}
```

### 3. Service Methods
```typescript
// Portfolio Service additions
@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = '/api/portfolios';

  constructor(private http: HttpClient) {}

  addUserToPortfolio(portfolioId: number, userId: number, investmentAmount: number): Observable<ApiResponse<PortfolioDto>> {
    const params = new HttpParams()
      .set('investmentAmount', investmentAmount.toString())
      .set('adminUserId', this.getCurrentUserId().toString()); // Get from auth service

    return this.http.post<ApiResponse<PortfolioDto>>(
      `${this.apiUrl}/${portfolioId}/users/${userId}/invest`,
      {},
      { params }
    );
  }

  withdrawUserFromPortfolio(portfolioId: number, userId: number, unitsToWithdraw: number): Observable<ApiResponse<PortfolioDto>> {
    const params = new HttpParams()
      .set('unitsToWithdraw', unitsToWithdraw.toString())
      .set('adminUserId', this.getCurrentUserId().toString());

    return this.http.post<ApiResponse<PortfolioDto>>(
      `${this.apiUrl}/${portfolioId}/users/${userId}/withdraw`,
      {},
      { params }
    );
  }

  private getCurrentUserId(): number {
    // Get current user ID from authentication service
    return 1; // Placeholder
  }
}
```

### 4. Portfolio Details Integration
```html
<!-- In Portfolio Details Component -->
<mat-card class="portfolio-investors-card">
  <mat-card-header>
    <mat-card-title>Portfolio Investors</mat-card-title>
    <div class="header-actions">
      <button mat-raised-button 
              color="primary" 
              (click)="openAddUserDialog()"
              *ngIf="isAdmin">
        <mat-icon>person_add</mat-icon>
        Add User
      </button>
    </div>
  </mat-card-header>
  
  <mat-card-content>
    <!-- Investors table -->
    <table mat-table [dataSource]="portfolioInvestors" class="investors-table">
      
      <!-- User Column -->
      <ng-container matColumnDef="user">
        <th mat-header-cell *matHeaderCellDef>Investor</th>
        <td mat-cell *matCellDef="let investment">
          <div class="user-info">
            <div class="user-name">{{ investment.user.firstName }} {{ investment.user.lastName }}</div>
            <div class="user-email">{{ investment.user.email }}</div>
          </div>
        </td>
      </ng-container>
      
      <!-- Investment Column -->
      <ng-container matColumnDef="investment">
        <th mat-header-cell *matHeaderCellDef>Investment</th>
        <td mat-cell *matCellDef="let investment">
          <div class="investment-info">
            <div class="amount">₹{{ investment.totalInvested | currency }}</div>
            <div class="units">{{ investment.unitsHeld | number:'1.4-4' }} units</div>
          </div>
        </td>
      </ng-container>
      
      <!-- Current Value Column -->
      <ng-container matColumnDef="currentValue">
        <th mat-header-cell *matHeaderCellDef>Current Value</th>
        <td mat-cell *matCellDef="let investment">
          <div class="value-info">
            <div class="current-value">₹{{ investment.currentValue | currency }}</div>
            <div class="returns" 
                 [class.positive]="investment.totalReturns >= 0"
                 [class.negative]="investment.totalReturns < 0">
              {{ investment.totalReturns >= 0 ? '+' : '' }}₹{{ investment.totalReturns | currency }}
              ({{ investment.returnPercentage | number:'1.2-2' }}%)
            </div>
          </div>
        </td>
      </ng-container>
      
      <!-- Fees Column -->
      <ng-container matColumnDef="fees">
        <th mat-header-cell *matHeaderCellDef>Fees Paid</th>
        <td mat-cell *matCellDef="let investment">₹{{ investment.totalChargesPaid | currency }}</td>
      </ng-container>
      
      <!-- Actions Column -->
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let investment">
          <button mat-icon-button [matMenuTriggerFor]="investmentMenu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #investmentMenu="matMenu">
            <button mat-menu-item (click)="viewInvestmentDetails(investment)">
              <mat-icon>visibility</mat-icon>
              View Details
            </button>
            <button mat-menu-item 
                    (click)="openWithdrawDialog(investment)"
                    *ngIf="isAdmin">
              <mat-icon>remove_circle</mat-icon>
              Withdraw
            </button>
          </mat-menu>
        </td>
      </ng-container>
      
      <tr mat-header-row *matHeaderRowDef="investorColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: investorColumns;"></tr>
    </table>
    
    <!-- No investors message -->
    <div class="no-investors" *ngIf="portfolioInvestors.length === 0">
      <mat-icon>people_outline</mat-icon>
      <h3>No Investors Yet</h3>
      <p>This portfolio doesn't have any investors. Add users to start building the portfolio.</p>
      <button mat-raised-button color="primary" (click)="openAddUserDialog()" *ngIf="isAdmin">
        Add First Investor
      </button>
    </div>
  </mat-card-content>
</mat-card>
```

### 5. Portfolio Details Component Methods
```typescript
export class PortfolioDetailsComponent implements OnInit {
  portfolioInvestors: UserInvestmentDto[] = [];
  investorColumns = ['user', 'investment', 'currentValue', 'fees', 'actions'];

  openAddUserDialog() {
    const dialogRef = this.dialog.open(AddUserToPortfolioDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { portfolioId: this.portfolioId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPortfolioInvestors();
        this.loadPortfolioDetails(); // Refresh portfolio data
      }
    });
  }

  loadPortfolioInvestors() {
    this.userInvestmentService.getInvestmentsByPortfolioId(this.portfolioId, true)
      .subscribe(response => {
        this.portfolioInvestors = response.data;
      });
  }

  openWithdrawDialog(investment: UserInvestmentDto) {
    const dialogRef = this.dialog.open(WithdrawUserDialogComponent, {
      width: '600px',
      data: { 
        portfolioId: this.portfolioId,
        investment: investment
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPortfolioInvestors();
        this.loadPortfolioDetails();
      }
    });
  }
}
```

## Key Features Summary

### 1. **Automatic Fee Distribution**
- ✅ **No separate UI call needed** - fees are automatically calculated and distributed by the API
- ✅ **Fair allocation** - existing users get credit-backs when new users join
- ✅ **Transparent calculation** - UI shows preview of fee impact before confirmation

### 2. **User Experience**
- ✅ **Searchable user selection** - find users by name, email, or username
- ✅ **Real-time fee preview** - see exact fee impact before adding user
- ✅ **Confirmation required** - user must acknowledge fee impact
- ✅ **Clear feedback** - success/error messages with details

### 3. **Admin Controls**
- ✅ **Permission-based access** - only admins can add users to portfolios
- ✅ **Investment validation** - minimum amounts and proper validation
- ✅ **Existing user exclusion** - can't add users already in portfolio

### 4. **Integration Points**
- ✅ **Portfolio details integration** - seamless addition to portfolio management
- ✅ **User management integration** - leverages existing user search and selection
- ✅ **Fee system integration** - automatic fee calculation and distribution
- ✅ **Transaction tracking** - all actions are properly recorded

## Questions for Clarification

1. **Minimum Investment Amount**: What should be the minimum investment amount? Currently set to ₹1.

2. **User Selection Restrictions**: Should there be any restrictions on which users can be added (e.g., only active users, users with specific roles)?

3. **Investment Limits**: Should there be maximum investment limits per user or per portfolio?

4. **Notification System**: Should users be notified when they're added to a portfolio or when they receive fee credit-backs?

5. **Approval Workflow**: Should user additions require approval, or should they be immediate?

The current implementation provides a complete, user-friendly interface for adding users to portfolios with automatic fee distribution handled by the backend API. The system ensures fairness, transparency, and proper tracking of all investment activities.
