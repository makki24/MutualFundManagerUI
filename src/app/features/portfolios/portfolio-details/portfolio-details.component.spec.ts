import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { AddUserToPortfolioDialogComponent } from './add-user-to-portfolio-dialog/add-user-to-portfolio-dialog.component';
import { WithdrawUserDialogComponent } from './withdraw-user-dialog/withdraw-user-dialog.component';

import { PortfolioDetailsComponent } from './portfolio-details.component';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { InvestmentService } from '../../../core/services/investment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Portfolio } from '../../../core/models/portfolio.model';
import { Investment } from '../../../core/models/investment.model';
import { ApiResponse } from '../../../core/models/api-response.model';

describe('PortfolioDetailsComponent', () => {
  let component: PortfolioDetailsComponent;
  let fixture: ComponentFixture<PortfolioDetailsComponent>;
  let mockPortfolioService: jasmine.SpyObj<PortfolioService>;
  let mockInvestmentService: jasmine.SpyObj<InvestmentService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockActivatedRoute: any;

  const mockPortfolio: Portfolio = {
    id: 1,
    name: 'Test Portfolio',
    navValue: 10.5,
    totalAum: 100000,
    totalUnits: 9523.81,
    remainingCash: 5000,
    totalInvestors: 2,
    totalHoldings: 5,
    createdBy: { id: 1, username: 'admin' },
    createdAt: '2024-01-01T00:00:00Z'
  };

  const mockInvestments: Investment[] = [
    {
      id: 1,
      user: { id: 1, username: 'user1' },
      portfolio: { id: 1, name: 'Test Portfolio' },
      unitsHeld: 500,
      totalInvested: 5000,
      averageNav: 10.0,
      currentValue: 5250,
      totalChargesPaid: 100,
      totalReturns: 250,
      returnPercentage: 5.0,
      aumPercentage: 52.5
    },
    {
      id: 2,
      user: { id: 2, username: 'user2' },
      portfolio: { id: 1, name: 'Test Portfolio' },
      unitsHeld: 450,
      totalInvested: 4500,
      averageNav: 10.0,
      currentValue: 4725,
      totalChargesPaid: 90,
      totalReturns: 225,
      returnPercentage: 5.0,
      aumPercentage: 47.5
    }
  ];

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
    mockPortfolioService = jasmine.createSpyObj('PortfolioService', ['getPortfolioDetails']);
    mockInvestmentService = jasmine.createSpyObj('InvestmentService', ['getPortfolioInvestments']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAdmin', 'getCurrentUser']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [PortfolioDetailsComponent, BrowserAnimationsModule],
      providers: [
        { provide: PortfolioService, useValue: mockPortfolioService },
        { provide: InvestmentService, useValue: mockInvestmentService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load portfolio details on init', () => {
    mockAuthService.isAdmin.and.returnValue(true);
    mockPortfolioService.getPortfolioDetails.and.returnValue(
      of(createApiResponse(mockPortfolio))
    );
    mockInvestmentService.getPortfolioInvestments.and.returnValue(
      of(createApiResponse(mockInvestments))
    );

    component.ngOnInit();

    expect(mockPortfolioService.getPortfolioDetails).toHaveBeenCalledWith(1);
    expect(mockInvestmentService.getPortfolioInvestments).toHaveBeenCalledWith(1);
    expect(component.portfolio).toEqual(mockPortfolio);
    expect(component.portfolioInvestments).toEqual(mockInvestments);
    expect(component.isAdmin).toBe(true);
  });

  it('should handle portfolio loading error', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    mockAuthService.isAdmin.and.returnValue(false);
    mockPortfolioService.getPortfolioDetails.and.returnValue(
      throwError(() => new Error('Failed to load'))
    );
    mockInvestmentService.getPortfolioInvestments.and.returnValue(
      of(createApiResponse([]))
    );

    component.ngOnInit();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load portfolio details:', jasmine.any(Error));
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Failed to load portfolio details',
      'Close',
      { duration: 5000 }
    );
    expect(component.isLoading).toBe(false);
  });

  it('should handle investments loading error', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    mockAuthService.isAdmin.and.returnValue(false);
    mockPortfolioService.getPortfolioDetails.and.returnValue(
      of(createApiResponse(mockPortfolio))
    );
    mockInvestmentService.getPortfolioInvestments.and.returnValue(
      throwError(() => new Error('Failed to load investments'))
    );

    component.ngOnInit();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load portfolio investments:', jasmine.any(Error));
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Failed to load portfolio investments',
      'Close',
      { duration: 5000 }
    );
    expect(component.investmentsLoading).toBe(false);
  });

  it('should navigate back to portfolios', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/portfolios']);
  });

  it('should navigate to fees management', () => {
    component.portfolioId = 1;
    component.manageFees();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/portfolios', 1, 'fees']);
  });

  it('should open add user dialog for admin', () => {
    component.isAdmin = true;
    component.portfolioId = 1;
    const dialogRef = { afterClosed: () => of(true) };
    mockDialog.open.and.returnValue(dialogRef as any);

    const loadInvestmentsSpy = spyOn(component, 'loadPortfolioInvestments');
    const loadDetailsSpy = spyOn(component, 'loadPortfolioDetails');

    component.openAddUserDialog();

    expect(mockDialog.open).toHaveBeenCalledWith(AddUserToPortfolioDialogComponent, {
      width: jasmine.any(String),
      maxHeight: jasmine.any(String),
      data: { portfolioId: 1 }
    });
    
    // Test the dialog closed callback
    dialogRef.afterClosed().subscribe(() => {
      expect(loadInvestmentsSpy).toHaveBeenCalled();
      expect(loadDetailsSpy).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'User added to portfolio successfully',
        'Close',
        { duration: 3000 }
      );
    });
  });

  it('should open withdraw dialog for admin', () => {
    component.isAdmin = true;
    component.portfolioId = 1;
    const testInvestment = mockInvestments[0];
    const dialogRef = { afterClosed: () => of(true) };
    mockDialog.open.and.returnValue(dialogRef as any);

    const loadInvestmentsSpy = spyOn(component, 'loadPortfolioInvestments');
    const loadDetailsSpy = spyOn(component, 'loadPortfolioDetails');

    component.openWithdrawDialog(testInvestment);

    expect(mockDialog.open).toHaveBeenCalledWith(WithdrawUserDialogComponent, {
      width: jasmine.any(String),
      data: {
        portfolioId: 1,
        investment: testInvestment
      }
    });
    
    // Test the dialog closed callback
    dialogRef.afterClosed().subscribe(() => {
      expect(loadInvestmentsSpy).toHaveBeenCalled();
      expect(loadDetailsSpy).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'User withdrawal processed successfully',
        'Close',
        { duration: 3000 }
      );
    });
  });

  it('should redirect to portfolios if no portfolio ID', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

    component.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/portfolios']);
  });

  it('should display investment details message', () => {
    component.viewInvestmentDetails(mockInvestments[0]);

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Investment details for user1 coming soon!',
      'Close',
      { duration: 3000 }
    );
  });
});
