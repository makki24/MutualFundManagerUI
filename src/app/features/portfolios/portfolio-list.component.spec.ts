import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { PortfolioListComponent } from './portfolio-list.component';
import { PortfolioService } from '../../core/services/portfolio.service';
import { AuthService } from '../../core/services/auth.service';
import { Portfolio } from '../../core/models/portfolio.model';
import { ApiResponse } from '../../core/models/api-response.model';
import { User } from '../../core/models/user.model';

describe('PortfolioListComponent', () => {
  let component: PortfolioListComponent;
  let fixture: ComponentFixture<PortfolioListComponent>;
  let mockPortfolioService: jasmine.SpyObj<PortfolioService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockAdminUser: User = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN'
  };

  const mockRegularUser: User = {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    firstName: 'Regular',
    lastName: 'User',
    role: 'USER'
  };

  const mockPortfolios: Portfolio[] = [
    {
      id: 1,
      name: 'Growth Portfolio',
      description: 'High growth portfolio',
      navValue: 10.5000,
      totalAum: 100000,
      totalUnits: 9523.81,
      remainingCash: 5000,
      isActive: true,
      totalInvestors: 5,
      totalHoldings: 3,
      totalHoldingsValue: 95000,
      totalPortfolioValue: 100000,
      createdBy: {
        id: 1,
        username: 'admin'
      },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Conservative Portfolio',
      description: 'Low risk portfolio',
      navValue: 11.2000,
      totalAum: 50000,
      totalUnits: 4464.29,
      remainingCash: 2000,
      isActive: true,
      totalInvestors: 3,
      totalHoldings: 2,
      totalHoldingsValue: 48000,
      totalPortfolioValue: 50000,
      createdBy: {
        id: 1,
        username: 'admin'
      },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    const portfolioServiceSpy = jasmine.createSpyObj('PortfolioService', ['getPortfolios']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        PortfolioListComponent,
        BrowserAnimationsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: PortfolioService, useValue: portfolioServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioListComponent);
    component = fixture.componentInstance;
    mockPortfolioService = TestBed.inject(PortfolioService) as jasmine.SpyObj<PortfolioService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with admin status and load portfolios', () => {
    mockAuthService.isAdmin.and.returnValue(true);
    const portfoliosResponse: ApiResponse<Portfolio[]> = {
      success: true,
      data: mockPortfolios,
      message: 'Portfolios retrieved successfully',
      timestamp: new Date().toISOString(),
      error: null
    };
    mockPortfolioService.getPortfolios.and.returnValue(of(portfoliosResponse));

    component.ngOnInit();

    expect(component.isAdmin).toBe(true);
    expect(mockPortfolioService.getPortfolios).toHaveBeenCalled();
    expect(component.portfolios).toEqual(mockPortfolios);
    expect(component.isLoading).toBe(false);
  });

  it('should initialize with non-admin status', () => {
    mockAuthService.isAdmin.and.returnValue(false);
    const portfoliosResponse: ApiResponse<Portfolio[]> = {
      success: true,
      data: mockPortfolios,
      message: 'Portfolios retrieved successfully',
      timestamp: new Date().toISOString(),
      error: null
    };
    mockPortfolioService.getPortfolios.and.returnValue(of(portfoliosResponse));

    component.ngOnInit();

    expect(component.isAdmin).toBe(false);
    expect(component.portfolios).toEqual(mockPortfolios);
  });

  it('should handle error when loading portfolios', () => {
    spyOn(console, 'error');
    mockAuthService.isAdmin.and.returnValue(true);
    mockPortfolioService.getPortfolios.and.returnValue(
      throwError(() => new Error('Failed to load portfolios'))
    );

    component.ngOnInit();

    expect(component.isLoading).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Failed to load portfolios:', jasmine.any(Error));
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Failed to load portfolios',
      'Close',
      { duration: 5000 }
    );
  });

  it('should navigate to fee management page when manageFees is called', () => {
    const portfolioId = 1;

    component.manageFees(portfolioId);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/portfolios', portfolioId, 'fees']);
  });

  it('should show snackbar message when createPortfolio is called', () => {
    const mockDialogRef = {
      afterClosed: () => of(false)
    };
    mockDialog.open.and.returnValue(mockDialogRef as any);

    component.createPortfolio();

    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should navigate to portfolio details when viewPortfolio is called', () => {
    const portfolioId = 1;

    component.viewPortfolio(portfolioId);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/portfolios', portfolioId]);
  });

  it('should show snackbar message when managePortfolio is called', () => {
    const portfolioId = 1;

    component.managePortfolio(portfolioId);

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `Manage portfolio ${portfolioId} feature coming soon!`,
      'Close',
      { duration: 3000 }
    );
  });

  it('should load portfolios successfully', () => {
    const portfoliosResponse: ApiResponse<Portfolio[]> = {
      success: true,
      data: mockPortfolios,
      message: 'Portfolios retrieved successfully',
      timestamp: new Date().toISOString(),
      error: null
    };
    mockPortfolioService.getPortfolios.and.returnValue(of(portfoliosResponse));

    component.loadPortfolios();

    expect(component.portfolios).toEqual(mockPortfolios);
    expect(component.isLoading).toBe(false);
  });

  it('should handle empty portfolios response', () => {
    const portfoliosResponse: ApiResponse<Portfolio[]> = {
      success: true,
      data: [],
      message: 'No portfolios found',
      timestamp: new Date().toISOString(),
      error: null
    };
    mockPortfolioService.getPortfolios.and.returnValue(of(portfoliosResponse));

    component.loadPortfolios();

    expect(component.portfolios).toEqual([]);
    expect(component.isLoading).toBe(false);
  });

  it('should handle null portfolios data', () => {
    const portfoliosResponse: ApiResponse<Portfolio[]> = {
      success: true,
      data: null,
      message: 'No portfolios found',
      timestamp: new Date().toISOString(),
      error: null
    };
    mockPortfolioService.getPortfolios.and.returnValue(of(portfoliosResponse));

    component.loadPortfolios();

    expect(component.portfolios).toEqual([]);
    expect(component.isLoading).toBe(false);
  });

  it('should have correct display columns', () => {
    expect(component.displayedColumns).toEqual([
      'name', 'nav', 'aum', 'units', 'cash', 'investors', 'holdings', 'actions'
    ]);
  });

  it('should set loading state correctly during portfolio loading', () => {
    const portfoliosResponse: ApiResponse<Portfolio[]> = {
      success: true,
      data: mockPortfolios,
      message: 'Portfolios retrieved successfully',
      timestamp: new Date().toISOString(),
      error: null
    };
    mockPortfolioService.getPortfolios.and.returnValue(of(portfoliosResponse));

    expect(component.isLoading).toBe(true); // Initial state

    component.loadPortfolios();

    expect(component.isLoading).toBe(false); // After loading
  });
});
