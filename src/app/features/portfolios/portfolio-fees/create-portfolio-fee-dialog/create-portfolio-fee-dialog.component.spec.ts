import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { CreatePortfolioFeeDialogComponent } from './create-portfolio-fee-dialog.component';
import { PortfolioFeeService } from '../../../../core/services/portfolio-fee.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CreatePortfolioFeeRequest, PortfolioFee } from '../../../../core/models/portfolio.model';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { User } from '../../../../core/models/user.model';

describe('CreatePortfolioFeeDialogComponent', () => {
  let component: CreatePortfolioFeeDialogComponent;
  let fixture: ComponentFixture<CreatePortfolioFeeDialogComponent>;
  let mockPortfolioFeeService: jasmine.SpyObj<PortfolioFeeService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<CreatePortfolioFeeDialogComponent>>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockUser: User = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN'
  };

  const mockDialogData = {
    portfolioId: 1
  };

  beforeEach(async () => {
    const portfolioFeeServiceSpy = jasmine.createSpyObj('PortfolioFeeService', ['createPortfolioFee']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        CreatePortfolioFeeDialogComponent,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: PortfolioFeeService, useValue: portfolioFeeServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePortfolioFeeDialogComponent);
    component = fixture.componentInstance;
    mockPortfolioFeeService = TestBed.inject(PortfolioFeeService) as jasmine.SpyObj<PortfolioFeeService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<CreatePortfolioFeeDialogComponent>>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    // Setup default mocks
    mockAuthService.getCurrentUser.and.returnValue(mockUser);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    component.ngOnInit();

    expect(component.createFeeForm.get('totalFeeAmount')?.value).toBe(0);
    expect(component.createFeeForm.get('fromDate')?.value).toBeInstanceOf(Date);
    expect(component.createFeeForm.get('toDate')?.value).toBe('');
    expect(component.createFeeForm.get('description')?.value).toBe('');
  });

  it('should validate required fields', () => {
    component.ngOnInit();

    expect(component.createFeeForm.valid).toBe(false);

    // Fill required fields
    component.createFeeForm.patchValue({
      totalFeeAmount: 1000,
      fromDate: new Date('2025-01-01'),
      toDate: new Date('2025-01-31')
    });

    expect(component.createFeeForm.valid).toBe(true);
  });

  it('should validate minimum fee amount', () => {
    component.ngOnInit();

    component.createFeeForm.patchValue({
      totalFeeAmount: -100
    });

    expect(component.createFeeForm.get('totalFeeAmount')?.hasError('min')).toBe(true);

    component.createFeeForm.patchValue({
      totalFeeAmount: 0
    });

    expect(component.createFeeForm.get('totalFeeAmount')?.hasError('min')).toBe(false);
  });

  it('should validate date range', () => {
    component.ngOnInit();

    const fromDate = new Date('2025-01-31');
    const toDate = new Date('2025-01-01'); // Before from date

    component.createFeeForm.patchValue({
      fromDate,
      toDate
    });

    expect(component.createFeeForm.hasError('dateRangeInvalid')).toBe(true);

    // Fix the date range
    component.createFeeForm.patchValue({
      toDate: new Date('2025-02-01')
    });

    expect(component.createFeeForm.hasError('dateRangeInvalid')).toBe(false);
  });

  it('should update fee preview when form values change', () => {
    component.ngOnInit();

    component.createFeeForm.patchValue({
      totalFeeAmount: 1000,
      fromDate: new Date('2025-01-01'),
      toDate: new Date('2025-01-31')
    });

    component.updateFeePreview();

    expect(component.feePreview).toBeDefined();
    expect(component.feePreview?.totalDays).toBe(30);
    expect(component.feePreview?.totalFeeAmount).toBe(1000);
    expect(component.feePreview?.dailyRate).toBeCloseTo(33.33, 2);
  });

  it('should handle zero fee amount in preview', () => {
    component.ngOnInit();

    component.createFeeForm.patchValue({
      totalFeeAmount: 0,
      fromDate: new Date('2025-01-01'),
      toDate: new Date('2025-01-31')
    });

    component.updateFeePreview();

    expect(component.feePreview).toBeDefined();
    expect(component.feePreview?.totalFeeAmount).toBe(0);
    expect(component.feePreview?.dailyRate).toBe(0);
  });

  it('should adjust toDate when fromDate changes', () => {
    component.ngOnInit();

    const newFromDate = new Date('2025-02-01');
    component.createFeeForm.patchValue({
      fromDate: newFromDate
    });

    component.onFromDateChange();

    const toDate = component.createFeeForm.get('toDate')?.value;
    expect(toDate).toBeInstanceOf(Date);
    expect(toDate.getTime()).toBeGreaterThan(newFromDate.getTime());
  });

  it('should create fee successfully', () => {
    component.ngOnInit();

    component.createFeeForm.patchValue({
      totalFeeAmount: 1000,
      fromDate: new Date('2025-01-01'),
      toDate: new Date('2025-01-31'),
      description: 'Test fee'
    });

    const mockResponse: ApiResponse<PortfolioFee> = {
      success: true,
      data: {} as PortfolioFee,
      message: 'Fee created successfully',
      timestamp: new Date().toISOString(),
      error: null
    };

    mockPortfolioFeeService.createPortfolioFee.and.returnValue(of(mockResponse));

    component.createFee();

    expect(mockPortfolioFeeService.createPortfolioFee).toHaveBeenCalledWith(
      1,
      jasmine.objectContaining({
        totalFeeAmount: 1000,
        fromDate: '2025-01-01',
        toDate: '2025-01-31',
        description: 'Test fee'
      }),
      1
    );
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    expect(component.isSubmitting).toBe(false);
  });

  it('should handle fee creation error', () => {
    component.ngOnInit();

    component.createFeeForm.patchValue({
      totalFeeAmount: 1000,
      fromDate: new Date('2025-01-01'),
      toDate: new Date('2025-01-31')
    });

    mockPortfolioFeeService.createPortfolioFee.and.returnValue(
      throwError(() => ({ error: { message: 'Creation failed' } }))
    );

    component.createFee();

    expect(component.isSubmitting).toBe(false);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Creation failed',
      'Close',
      { duration: 5000 }
    );
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should not create fee if form is invalid', () => {
    component.ngOnInit();

    // Leave form invalid (missing required fields)
    component.createFee();

    expect(mockPortfolioFeeService.createPortfolioFee).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
  });

  it('should handle unauthenticated user', () => {
    component.ngOnInit();
    mockAuthService.getCurrentUser.and.returnValue(null);

    component.createFeeForm.patchValue({
      totalFeeAmount: 1000,
      fromDate: new Date('2025-01-01'),
      toDate: new Date('2025-01-31')
    });

    component.createFee();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'User not authenticated',
      'Close',
      { duration: 3000 }
    );
    expect(mockPortfolioFeeService.createPortfolioFee).not.toHaveBeenCalled();
  });

  it('should provide correct error messages', () => {
    component.ngOnInit();

    // Test required field error
    component.createFeeForm.get('totalFeeAmount')?.markAsTouched();
    component.createFeeForm.get('totalFeeAmount')?.setValue('');
    expect(component.getFormErrorMessage('totalFeeAmount')).toBe('Fee amount is required');

    // Test minimum value error
    component.createFeeForm.get('totalFeeAmount')?.setValue(-1);
    expect(component.getFormErrorMessage('totalFeeAmount')).toBe('Fee amount must be non-negative');

    // Test date range error
    component.createFeeForm.patchValue({
      fromDate: new Date('2025-01-31'),
      toDate: new Date('2025-01-01')
    });
    component.createFeeForm.get('toDate')?.markAsTouched();
    expect(component.getFormErrorMessage('toDate')).toBe('To date must be after from date');
  });

  it('should check form field errors correctly', () => {
    component.ngOnInit();

    // Initially no errors shown (not touched)
    expect(component.hasFormError('totalFeeAmount')).toBe(false);

    // Mark as touched and invalid
    component.createFeeForm.get('totalFeeAmount')?.markAsTouched();
    component.createFeeForm.get('totalFeeAmount')?.setValue('');
    expect(component.hasFormError('totalFeeAmount')).toBe(true);

    // Fix the error
    component.createFeeForm.get('totalFeeAmount')?.setValue(1000);
    expect(component.hasFormError('totalFeeAmount')).toBe(false);
  });

  it('should handle description field correctly', () => {
    component.ngOnInit();

    // Test with description
    component.createFeeForm.patchValue({
      totalFeeAmount: 1000,
      fromDate: new Date('2025-01-01'),
      toDate: new Date('2025-01-31'),
      description: 'Monthly management fee'
    });

    const mockResponse: ApiResponse<PortfolioFee> = {
      success: true,
      data: {} as PortfolioFee,
      message: 'Fee created successfully',
      timestamp: new Date().toISOString(),
      error: null
    };

    mockPortfolioFeeService.createPortfolioFee.and.returnValue(of(mockResponse));

    component.createFee();

    const expectedRequest: CreatePortfolioFeeRequest = {
      totalFeeAmount: 1000,
      fromDate: '2025-01-01',
      toDate: '2025-01-31',
      description: 'Monthly management fee'
    };

    expect(mockPortfolioFeeService.createPortfolioFee).toHaveBeenCalledWith(
      1,
      expectedRequest,
      1
    );

    // Test without description
    component.createFeeForm.patchValue({
      description: ''
    });

    component.createFee();

    const expectedRequestNoDesc: CreatePortfolioFeeRequest = {
      totalFeeAmount: 1000,
      fromDate: '2025-01-01',
      toDate: '2025-01-31',
      description: undefined
    };

    expect(mockPortfolioFeeService.createPortfolioFee).toHaveBeenCalledWith(
      1,
      expectedRequestNoDesc,
      1
    );
  });
});
