import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { PortfolioFeesComponent } from './portfolio-fees.component';
import { PortfolioFeeService } from '../../../core/services/portfolio-fee.service';
import { AuthService } from '../../../core/services/auth.service';
import { PortfolioFee } from '../../../core/models/portfolio.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { User } from '../../../core/models/user.model';

describe('PortfolioFeesComponent', () => {
  let component: PortfolioFeesComponent;
  let fixture: ComponentFixture<PortfolioFeesComponent>;
  let mockPortfolioFeeService: jasmine.SpyObj<PortfolioFeeService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockUser: User = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN'
  };

  const mockPortfolioFees: PortfolioFee[] = [
    {
      id: 1,
      portfolioId: 1,
      portfolioName: 'Test Portfolio',
      totalFeeAmount: 1000,
      remainingFeeAmount: 500,
      fromDate: '2025-01-01',
      toDate: '2025-01-31',
      isActive: true,
      description: 'Monthly fee',
      createdByUserId: 1,
      createdByUserName: 'admin',
      createdAt: '2025-01-01T00:00:00Z',
      totalDays: 31,
      remainingDays: 15,
      dailyFeeAmount: 32.26,
      allocatedFeeAmount: 500
    },
    {
      id: 2,
      portfolioId: 1,
      portfolioName: 'Test Portfolio',
      totalFeeAmount: 800,
      remainingFeeAmount: 0,
      fromDate: '2024-12-01',
      toDate: '2024-12-31',
      isActive: false,
      description: 'Previous month fee',
      createdByUserId: 1,
      createdByUserName: 'admin',
      createdAt: '2024-12-01T00:00:00Z',
      totalDays: 31,
      remainingDays: 0,
      dailyFeeAmount: 25.81,
      allocatedFeeAmount: 800
    }
  ];

  beforeEach(async () => {
    const portfolioFeeServiceSpy = jasmine.createSpyObj('PortfolioFeeService', [
      'getPortfolioFees',
      'deactivatePortfolioFee'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        PortfolioFeesComponent,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: PortfolioFeeService, useValue: portfolioFeeServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioFeesComponent);
    component = fixture.componentInstance;
    mockPortfolioFeeService = TestBed.inject(PortfolioFeeService) as jasmine.SpyObj<PortfolioFeeService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default mocks
    mockAuthService.getCurrentUser.and.returnValue(mockUser);

    // Setup default successful response to prevent ngOnInit from failing
    const defaultResponse: ApiResponse<PortfolioFee[]> = {
      success: true,
      data: [],
      message: 'Success',
      timestamp: new Date().toISOString(),
      error: null
    };
    mockPortfolioFeeService.getPortfolioFees.and.returnValue(of(defaultResponse));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with portfolio ID and admin status', () => {
    const feesResponse: ApiResponse<PortfolioFee[]> = {
      success: true,
      data: mockPortfolioFees,
      message: 'Fees retrieved successfully',
      timestamp: new Date().toISOString(),
      error: null
    };
    mockPortfolioFeeService.getPortfolioFees.and.returnValue(of(feesResponse));

    component.ngOnInit();

    expect(component.portfolioId).toBe(1);
    expect(component.isAdmin).toBe(true);
    expect(mockPortfolioFeeService.getPortfolioFees).toHaveBeenCalledWith(1);
  });

  it('should load portfolio fees and identify active fee', () => {
    const feesResponse: ApiResponse<PortfolioFee[]> = {
      success: true,
      data: mockPortfolioFees,
      message: 'Fees retrieved successfully',
      timestamp: new Date().toISOString(),
      error: null
    };
    mockPortfolioFeeService.getPortfolioFees.and.returnValue(of(feesResponse));

    component.loadPortfolioFees();

    expect(component.allFees).toEqual(mockPortfolioFees);
    expect(component.activeFee).toEqual(mockPortfolioFees[0]); // First fee is active
    expect(component.isLoading).toBe(false);
  });

  it('should handle error when loading portfolio fees', fakeAsync(() => {
    // Initialize component first
    component.portfolioId = 1;
    component.isAdmin = true;

    // Clear any previous calls
    mockSnackBar.open.calls.reset();

    // Reset the spy to return error for this specific test
    mockPortfolioFeeService.getPortfolioFees.and.returnValue(
      throwError(() => new Error('Failed to load fees'))
    );

    component.loadPortfolioFees();
    tick(); // Process the async operation

    expect(component.isLoading).toBe(false);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Failed to load portfolio fees',
      'Close',
      { duration: 3000 }
    );
  }));

  it('should calculate fee allocation percentage correctly', () => {
    const fee = mockPortfolioFees[0];
    const percentage = component.getFeeAllocationPercentage(fee);
    expect(percentage).toBe(50); // 500/1000 * 100 = 50%
  });

  it('should return 100% for zero fee amounts', () => {
    const zeroFee: PortfolioFee = { ...mockPortfolioFees[0], totalFeeAmount: 0 };
    const percentage = component.getFeeAllocationPercentage(zeroFee);
    expect(percentage).toBe(100);
  });

  it('should format date range correctly', () => {
    const formatted = component.formatDateRange('2025-01-01', '2025-01-31');
    expect(formatted).toContain('2025');
    expect(formatted).toContain('-');
    expect(formatted.length).toBeGreaterThan(10); // Should contain both dates
  });

  it('should calculate days remaining correctly', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const remaining = component.getDaysRemaining(futureDate.toISOString());
    expect(remaining).toBe(10);
  });

  it('should return 0 for past dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const remaining = component.getDaysRemaining(pastDate.toISOString());
    expect(remaining).toBe(0);
  });

  it('should identify expired fees correctly', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const expired = component.isExpired(pastDate.toISOString());
    expect(expired).toBe(true);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const notExpired = component.isExpired(futureDate.toISOString());
    expect(notExpired).toBe(false);
  });

  it('should handle non-admin users correctly', () => {
    const nonAdminUser: User = { ...mockUser, role: 'USER' };
    mockAuthService.getCurrentUser.and.returnValue(nonAdminUser);

    const feesResponse: ApiResponse<PortfolioFee[]> = {
      success: true,
      data: [],
      message: 'Fees retrieved successfully',
      timestamp: new Date().toISOString(),
      error: null
    };
    mockPortfolioFeeService.getPortfolioFees.and.returnValue(of(feesResponse));

    component.ngOnInit();

    expect(component.isAdmin).toBe(false);
  });

  it('should show error when trying to create fee with active fee exists', () => {
    // Initialize component properly
    fixture.detectChanges(); // This ensures the component is properly initialized
    component.portfolioId = 1;
    component.isAdmin = true;
    component.activeFee = mockPortfolioFees[0];

    // Clear any previous calls
    mockSnackBar.open.calls.reset();

    component.openCreateFeeDialog();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Portfolio already has an active fee. Deactivate it first.',
      'Close',
      { duration: 3000 }
    );
    expect(mockDialog.open).not.toHaveBeenCalled();
  });

  it('should navigate back to portfolios when goBack is called', () => {
    component.portfolioId = 1;
    component.goBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/portfolios', 1]);
  });
});
