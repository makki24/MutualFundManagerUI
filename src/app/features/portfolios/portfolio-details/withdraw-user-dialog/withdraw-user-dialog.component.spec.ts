import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { WithdrawUserDialogComponent } from './withdraw-user-dialog.component';
import { InvestmentService } from '../../../../core/services/investment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Investment } from '../../../../core/models/investment.model';
import { ApiResponse } from '../../../../core/models/api-response.model';

describe('WithdrawUserDialogComponent', () => {
  let component: WithdrawUserDialogComponent;
  let fixture: ComponentFixture<WithdrawUserDialogComponent>;
  let mockInvestmentService: jasmine.SpyObj<InvestmentService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<WithdrawUserDialogComponent>>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockInvestment: Investment = {
    id: 1,
    user: { id: 1, username: 'user1' },
    portfolio: { id: 1, name: 'Test Portfolio' },
    unitsHeld: 1000,
    totalInvested: 10000,
    averageNav: 10.0,
    currentValue: 10500,
    totalChargesPaid: 100,
    totalReturns: 500,
    returnPercentage: 5.0,
    aumPercentage: 50.0
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
    mockInvestmentService = jasmine.createSpyObj('InvestmentService', ['withdrawFromPortfolio']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [WithdrawUserDialogComponent, BrowserAnimationsModule],
      providers: [
        { provide: InvestmentService, useValue: mockInvestmentService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MatSnackBar, useValue: mockSnackBar },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            portfolioId: 1,
            investment: mockInvestment
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WithdrawUserDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with correct validators and default to 100%', () => {
    component.ngOnInit();

    const unitsControl = component.withdrawForm.get('unitsToWithdraw');
    const confirmControl = component.withdrawForm.get('confirmWithdrawal');

    expect(unitsControl?.value).toBe(1000); // Should default to full withdrawal
    expect(confirmControl).toBeNull(); // Confirmation control should not exist
    expect(component.withdrawalPercentage).toBe(100); // Should be set to 100%
  });

  it('should calculate withdrawal impact correctly', () => {
    component.withdrawForm.patchValue({
      unitsToWithdraw: 500
    });

    component.calculateWithdrawalImpact();

    expect(component.withdrawalImpact).toBeTruthy();
    expect(component.withdrawalImpact?.unitsToWithdraw).toBe(500);
    expect(component.withdrawalImpact?.withdrawalAmount).toBe(5250); // 500 * 10.5 (current NAV)
    expect(component.withdrawalImpact?.remainingUnits).toBe(500);
    expect(component.withdrawalImpact?.remainingValue).toBe(5250);
    expect(component.withdrawalImpact?.withdrawalPercentage).toBe(50);
  });

  it('should not calculate impact with invalid input', () => {
    component.withdrawForm.patchValue({
      unitsToWithdraw: 0
    });

    component.calculateWithdrawalImpact();

    expect(component.withdrawalImpact).toBeNull();
    expect(component.withdrawalPercentage).toBe(0);
  });

  it('should set withdrawal percentage correctly', () => {
    component.setWithdrawalPercentage(25);

    expect(component.withdrawForm.get('unitsToWithdraw')?.value).toBe(250); // 25% of 1000
    expect(component.withdrawalPercentage).toBe(25);
  });

  it('should handle slider change', () => {
    const mockEvent = { target: { value: 75 } };
    spyOn(component, 'setWithdrawalPercentage');

    component.onSliderChange(mockEvent);

    expect(component.setWithdrawalPercentage).toHaveBeenCalledWith(75);
  });

  it('should process withdrawal successfully', () => {
    mockAuthService.getCurrentUser.and.returnValue({ id: 1, username: 'admin' } as any);
    mockInvestmentService.withdrawFromPortfolio.and.returnValue(
      of(createApiResponse({}))
    );

    component.withdrawForm.patchValue({
      unitsToWithdraw: 500
    });

    component.processWithdrawal();

    expect(mockInvestmentService.withdrawFromPortfolio).toHaveBeenCalledWith(1, 1, 500, 1, undefined);
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should handle withdrawal error', () => {
    spyOn(console, 'error');
    mockAuthService.getCurrentUser.and.returnValue({ id: 1, username: 'admin' } as any);
    mockInvestmentService.withdrawFromPortfolio.and.returnValue(
      throwError(() => ({ error: { message: 'Withdrawal failed' } }))
    );

    component.withdrawForm.patchValue({
      unitsToWithdraw: 500
    });

    component.processWithdrawal();

    expect(console.error).toHaveBeenCalledWith('Failed to process withdrawal:', jasmine.any(Object));
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Withdrawal failed',
      'Close',
      { duration: 5000 }
    );
    expect(component.isSubmitting).toBe(false);
  });

  it('should not process withdrawal with invalid form', () => {
    component.withdrawForm.patchValue({
      unitsToWithdraw: null
    });

    component.processWithdrawal();

    expect(mockInvestmentService.withdrawFromPortfolio).not.toHaveBeenCalled();
  });

  it('should validate maximum units correctly', () => {
    component.withdrawForm.patchValue({
      unitsToWithdraw: 1500 // More than available
    });

    const unitsControl = component.withdrawForm.get('unitsToWithdraw');
    expect(unitsControl?.hasError('max')).toBe(true);
  });

  it('should validate minimum units correctly', () => {
    component.withdrawForm.patchValue({
      unitsToWithdraw: 0.00001 // Less than minimum
    });

    const unitsControl = component.withdrawForm.get('unitsToWithdraw');
    expect(unitsControl?.hasError('min')).toBe(true);
  });

  it('should calculate 100% withdrawal correctly', () => {
    component.setWithdrawalPercentage(100);

    expect(component.withdrawForm.get('unitsToWithdraw')?.value).toBe(1000);
    expect(component.withdrawalPercentage).toBe(100);

    component.calculateWithdrawalImpact();

    expect(component.withdrawalImpact?.withdrawalPercentage).toBe(100);
    expect(component.withdrawalImpact?.remainingUnits).toBe(0);
  });

  it('should setup form validation on init', () => {
    spyOn(component, 'calculateWithdrawalImpact');

    component.ngOnInit();

    // Simulate value change
    component.withdrawForm.get('unitsToWithdraw')?.setValue(500);

    expect(component.calculateWithdrawalImpact).toHaveBeenCalled();
  });
});
