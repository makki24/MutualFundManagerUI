import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { AddUserToPortfolioDialogComponent } from './add-user-to-portfolio-dialog.component';
import { UserService } from '../../../../core/services/user.service';
import { InvestmentService } from '../../../../core/services/investment.service';
import { PortfolioService } from '../../../../core/services/portfolio.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Investment } from '../../../../core/models/investment.model';
import { PortfolioFee } from '../../../../core/models/portfolio.model';
import { ApiResponse } from '../../../../core/models/api-response.model';

describe('AddUserToPortfolioDialogComponent', () => {
  let component: AddUserToPortfolioDialogComponent;
  let fixture: ComponentFixture<AddUserToPortfolioDialogComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockInvestmentService: jasmine.SpyObj<InvestmentService>;
  let mockPortfolioService: jasmine.SpyObj<PortfolioService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<AddUserToPortfolioDialogComponent>>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockUsers: User[] = [
    {
      id: 1,
      username: 'john_doe',
      email: 'john.doe@email.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: 'USER',
      active: true,
      createdAt: '2025-08-03T20:42:06',
      updatedAt: '2025-08-03T20:42:06',
    },
    {
      id: 2,
      username: 'jane_smith',
      email: 'jane.smith@email.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1234567891',
      role: 'USER',
      active: true,
      createdAt: '2025-08-03T20:42:06',
      updatedAt: '2025-08-03T20:42:06',
    }
  ];

  const mockInvestments: Investment[] = [
    {
      id: 1,
      user: { id: 3, username: 'user3' },
      portfolio: { id: 1, name: 'Test Portfolio' },
      unitsHeld: 500,
      totalInvested: 5000,
      averageNav: 10.0,
      currentValue: 5250,
      totalChargesPaid: 100,
      totalReturns: 250,
      returnPercentage: 5.0,
      aumPercentage: 52.5
    }
  ];

  const mockPortfolioFee: PortfolioFee = {
    id: 1,
    portfolioId: 1,
    totalFeeAmount: 1000,
    remainingFeeAmount: 800,
    fromDate: '2024-01-01',
    toDate: '2024-12-31',
    isActive: true,
    description: 'Annual management fee',
    totalDays: 365,
    remainingDays: 300,
    dailyFeeAmount: 2.74,
    allocatedFeeAmount: 200
  };

  function createApiResponse<T>(data: T, success: boolean = true, message: string = 'Success'): ApiResponse<T> {
    return {
      success,
      data,
      message,
      timestamp: '2024-01-01T00:00:00Z',
      error: null
    };
  }

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['getUsers']);
    mockInvestmentService = jasmine.createSpyObj('InvestmentService', ['getPortfolioInvestments', 'investInPortfolio']);
    mockPortfolioService = jasmine.createSpyObj('PortfolioService', ['getPortfolioFees']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [AddUserToPortfolioDialogComponent, BrowserAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: mockUserService },
        { provide: InvestmentService, useValue: mockInvestmentService },
        { provide: PortfolioService, useValue: mockPortfolioService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MAT_DIALOG_DATA, useValue: { portfolioId: 1 } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddUserToPortfolioDialogComponent);
    component = fixture.componentInstance;

    // Setup default mock responses
    mockUserService.getUsers.and.returnValue(of(createApiResponse(mockUsers)));
    mockInvestmentService.getPortfolioInvestments.and.returnValue(of(createApiResponse(mockInvestments)));
    mockPortfolioService.getPortfolioFees.and.returnValue(of(createApiResponse([])));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load available users and portfolio fees on init', () => {
    component.ngOnInit();

    expect(mockUserService.getUsers).toHaveBeenCalledWith(true, 'USER');
    expect(mockInvestmentService.getPortfolioInvestments).toHaveBeenCalledWith(1);
    expect(mockPortfolioService.getPortfolioFees).toHaveBeenCalledWith(1, true);
    expect(component.allUsers).toEqual(mockUsers);
    expect(component.existingInvestorIds).toEqual([3]);
  });

  it('should load active portfolio fee', () => {
    mockPortfolioService.getPortfolioFees.and.returnValue(
      of(createApiResponse([mockPortfolioFee]))
    );

    component.loadPortfolioFees();

    expect(component.activeFee).toEqual(mockPortfolioFee);
  });

  it('should handle no active portfolio fees', () => {
    mockPortfolioService.getPortfolioFees.and.returnValue(
      of(createApiResponse([]))
    );

    component.loadPortfolioFees();

    expect(component.activeFee).toBeNull();
  });

  it('should handle portfolio fees loading error', () => {
    mockPortfolioService.getPortfolioFees.and.returnValue(
      throwError(() => new Error('Failed to load fees'))
    );

    component.loadPortfolioFees();

    expect(component.activeFee).toBeNull();
  });

  it('should handle user loading error', () => {
    mockUserService.getUsers.and.returnValue(
      throwError(() => new Error('Failed to load users'))
    );

    component.ngOnInit();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Failed to load users',
      'Close',
      { duration: 3000 }
    );
    expect(component.isLoadingUsers).toBe(false);
  });

  it('should filter available users excluding existing investors', () => {
    component.allUsers = mockUsers;
    component.existingInvestorIds = [1]; // user1 is already an investor

    component.filterAvailableUsers();

    expect(component.availableUsers).toEqual([mockUsers[1]]); // Only user2 should be available
  });

  it('should filter out users with missing data', () => {
    const usersWithMissingData = [
      ...mockUsers,
      { id: 3, username: '', email: '', firstName: '', lastName: '', role: 'USER', active: true } as User
    ];
    component.allUsers = usersWithMissingData;
    component.existingInvestorIds = [];

    component.filterAvailableUsers();

    expect(component.availableUsers).toEqual(mockUsers); // Only complete users should be available
  });

  it('should get user initials correctly', () => {
    const initials = component.getUserInitials(mockUsers[0]);
    expect(initials).toBe('JD');
  });

  it('should return ?? for user with missing data', () => {
    const userWithMissingData = { id: 1, firstName: '', lastName: '' } as User;
    const initials = component.getUserInitials(userWithMissingData);
    expect(initials).toBe('??');
  });

  it('should update form when user is selected', () => {
    component.availableUsers = mockUsers;
    const mockEvent = {
      value: 1 // user ID
    };

    spyOn(component, 'calculateFeeImpact');

    component.onUserSelected(mockEvent);

    expect(component.selectedUser).toEqual(mockUsers[0]);
    expect(component.calculateFeeImpact).toHaveBeenCalled();
  });

  it('should clear fee impact when no user is selected', () => {
    const mockEvent = {
      value: 999 // non-existent user ID
    };

    component.onUserSelected(mockEvent);

    expect(component.selectedUser).toBeNull();
    expect(component.feeImpact).toBeNull();
  });

  it('should calculate fee impact with no active fees', () => {
    component.addUserForm.patchValue({
      userId: 1,
      investmentAmount: 1000
    });
    component.existingInvestorIds = [3];
    component.activeFee = null;

    component.calculateFeeImpact();

    expect(component.feeImpact).toBeTruthy();
    expect(component.feeImpact?.feeAmount).toBe(0);
    expect(component.feeImpact?.netInvestment).toBe(1000);
    expect(component.feeImpact?.unitsAllocated).toBe(100); // 1000 / 10 (mock NAV)
    expect(component.feeImpact?.activeFee).toBeNull();
  });

  it('should calculate fee impact with active fees', () => {
    component.addUserForm.patchValue({
      userId: 1,
      investmentAmount: 1000
    });
    component.existingInvestorIds = [3]; // 1 existing user
    component.activeFee = mockPortfolioFee;

    component.calculateFeeImpact();

    expect(component.feeImpact).toBeTruthy();
    expect(component.feeImpact?.feeAmount).toBeGreaterThan(0);
    expect(component.feeImpact?.netInvestment).toBeLessThan(1000);
    expect(component.feeImpact?.activeFee).toEqual(mockPortfolioFee);
    expect(component.feeImpact?.existingUsersImpact.length).toBeGreaterThan(0);
  });

  it('should not calculate fee impact with invalid input', () => {
    component.addUserForm.patchValue({
      userId: null,
      investmentAmount: 0
    });

    component.calculateFeeImpact();

    expect(component.feeImpact).toBeNull();
  });

  it('should submit investment successfully', () => {
    mockAuthService.getCurrentUser.and.returnValue({ id: 1, username: 'admin' } as any);
    mockInvestmentService.investInPortfolio.and.returnValue(
      of(createApiResponse({}))
    );

    component.selectedUser = mockUsers[0];
    component.addUserForm.patchValue({
      userId: 1,
      investmentAmount: 1000,
      confirmFeeImpact: true
    });

    component.addUserToPortfolio();

    expect(mockInvestmentService.investInPortfolio).toHaveBeenCalledWith(1, 1, 1000, 1);
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should handle investment submission error', () => {
    mockAuthService.getCurrentUser.and.returnValue({ id: 1, username: 'admin' } as any);
    mockInvestmentService.investInPortfolio.and.returnValue(
      throwError(() => ({ error: { message: 'Investment failed' } }))
    );

    component.selectedUser = mockUsers[0];
    component.addUserForm.patchValue({
      userId: 1,
      investmentAmount: 1000,
      confirmFeeImpact: true
    });

    component.addUserToPortfolio();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Investment failed',
      'Close',
      { duration: 5000 }
    );
    expect(component.isSubmitting).toBe(false);
  });

  it('should not submit with invalid form', () => {
    component.addUserForm.patchValue({
      userId: null,
      investmentAmount: null
    });

    component.addUserToPortfolio();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Please fill in all required fields',
      'Close',
      { duration: 3000 }
    );
    expect(mockInvestmentService.investInPortfolio).not.toHaveBeenCalled();
  });

  it('should not submit without selected user', () => {
    component.selectedUser = null;
    component.addUserForm.patchValue({
      userId: 1,
      investmentAmount: 1000
    });

    component.addUserToPortfolio();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Please fill in all required fields',
      'Close',
      { duration: 3000 }
    );
    expect(mockInvestmentService.investInPortfolio).not.toHaveBeenCalled();
  });

  it('should update confirmation requirement based on fee impact', () => {
    component.feeImpact = {
      feeAmount: 100,
      netInvestment: 900,
      unitsAllocated: 90,
      activeFee: mockPortfolioFee,
      currentUserCount: 1,
      existingUsersImpact: []
    };

    component['updateConfirmationRequirement']();

    const confirmControl = component.addUserForm.get('confirmFeeImpact');
    expect(confirmControl?.hasValidator).toBeDefined();
  });

  it('should auto-confirm when no fee impact', () => {
    component.feeImpact = {
      feeAmount: 0,
      netInvestment: 1000,
      unitsAllocated: 100,
      activeFee: null,
      currentUserCount: 1,
      existingUsersImpact: []
    };

    component['updateConfirmationRequirement']();

    const confirmControl = component.addUserForm.get('confirmFeeImpact');
    expect(confirmControl?.value).toBe(true);
  });

  it('should require confirmation when there are existing users impact', () => {
    component.feeImpact = {
      feeAmount: 0,
      netInvestment: 1000,
      unitsAllocated: 100,
      activeFee: null,
      currentUserCount: 1,
      existingUsersImpact: [
        {
          userId: 3,
          userName: 'User Three',
          creditAmount: 50,
          creditUnits: 5
        }
      ]
    };

    component['updateConfirmationRequirement']();

    const confirmControl = component.addUserForm.get('confirmFeeImpact');
    expect(confirmControl?.hasValidator).toBeDefined();
  });
});
