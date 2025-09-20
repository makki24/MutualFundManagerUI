import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PortfolioCreateComponent } from './portfolio-create.component';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreatePortfolioRequest, Portfolio } from '../../../core/models/portfolio.model';
import { User } from '../../../core/models/user.model';
import { ApiResponse } from '../../../core/models/api-response.model';

describe('PortfolioCreateComponent', () => {
  let component: PortfolioCreateComponent;
  let fixture: ComponentFixture<PortfolioCreateComponent>;
  let mockPortfolioService: jasmine.SpyObj<PortfolioService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUsers: User[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', username: 'john.doe', email: 'john@example.com', role: 'USER' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', username: 'jane.smith', email: 'jane@example.com', role: 'USER' }
  ];

  const mockCurrentUser: User = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN'
  };

  beforeEach(async () => {
    const portfolioServiceSpy = jasmine.createSpyObj('PortfolioService', ['createPortfolio']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        PortfolioCreateComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatSnackBarModule,
        MatStepperModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatCardModule,
        MatTableModule,
        MatProgressSpinnerModule,
        MatDividerModule
      ],
      providers: [
        { provide: PortfolioService, useValue: portfolioServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioCreateComponent);
    component = fixture.componentInstance;
    mockPortfolioService = TestBed.inject(PortfolioService) as jasmine.SpyObj<PortfolioService>;
    mockUserService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default mocks
    const userResponse: ApiResponse<User[]> = {
      success: true,
      data: mockUsers,
      message: 'Users retrieved successfully',
      timestamp: new Date().toISOString(),
      error: null
    };
    mockUserService.getUsers.and.returnValue(of(userResponse));
    mockAuthService.getCurrentUser.and.returnValue(mockCurrentUser);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize forms correctly', () => {
    expect(component.basicInfoForm).toBeDefined();
    expect(component.investorsForm).toBeDefined();

    // Check that basic info form has the correct fields
    expect(component.basicInfoForm.get('name')).toBeDefined();
    expect(component.basicInfoForm.get('description')).toBeDefined();
    expect(component.basicInfoForm.get('initialNavValue')).toBeDefined();

    // Check that old fee fields are not present
    expect(component.basicInfoForm.get('managementFeePercentage')).toBeNull();
    expect(component.basicInfoForm.get('entryLoadPercentage')).toBeNull();
    expect(component.basicInfoForm.get('exitLoadPercentage')).toBeNull();
    expect(component.basicInfoForm.get('brokerageBuyPercentage')).toBeNull();
    expect(component.basicInfoForm.get('brokerageSellPercentage')).toBeNull();
  });

  it('should load users on init', () => {
    component.ngOnInit();

    expect(mockUserService.getUsers).toHaveBeenCalledWith(true, 'USER');
    expect(component.availableUsers.length).toBe(2);
    expect(component.availableUsers[0].firstName).toBe('John');
    expect(component.availableUsers[1].firstName).toBe('Jane');
  });

  it('should add investor correctly', () => {
    // Initialize component first
    component.ngOnInit();

    component.selectedUserId = 1;
    component.investmentAmount = 10000;

    component.addInvestor();

    expect(component.initialInvestors.length).toBe(1);
    expect(component.initialInvestors[0].userId).toBe(1);
    expect(component.initialInvestors[0].investmentAmount).toBe(10000);
    expect(component.initialInvestors[0].user.firstName).toBe('John');

    // Check that selection is reset
    expect(component.selectedUserId).toBeNull();
    expect(component.investmentAmount).toBeNull();
  });

  it('should remove investor correctly', () => {
    // Initialize component first
    component.ngOnInit();

    // Add an investor first
    component.selectedUserId = 1;
    component.investmentAmount = 10000;
    component.addInvestor();

    expect(component.initialInvestors.length).toBe(1);

    // Remove the investor
    component.removeInvestor(0);

    expect(component.initialInvestors.length).toBe(0);
  });

  it('should calculate total investment correctly', () => {
    // Initialize component first
    component.ngOnInit();

    // Add multiple investors
    component.selectedUserId = 1;
    component.investmentAmount = 10000;
    component.addInvestor();

    component.selectedUserId = 2;
    component.investmentAmount = 15000;
    component.addInvestor();

    expect(component.getTotalInvestment()).toBe(25000);
  });

  it('should create portfolio with correct payload structure', () => {
    // Initialize component first
    component.ngOnInit();

    // Setup form data
    component.basicInfoForm.patchValue({
      name: 'Growth Portfolio',
      description: 'High growth portfolio',
      initialNavValue: 10.0000
    });

    // Add an investor
    component.selectedUserId = 1;
    component.investmentAmount = 10000;
    component.addInvestor();

    // Mock successful creation
    const portfolioResponse: ApiResponse<Portfolio> = {
      success: true,
      data: {} as Portfolio,
      message: 'Portfolio created successfully',
      timestamp: new Date().toISOString(),
      error: null
    };
    mockPortfolioService.createPortfolio.and.returnValue(of(portfolioResponse));

    component.createPortfolio();

    expect(mockPortfolioService.createPortfolio).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'Growth Portfolio',
        description: 'High growth portfolio',
        initialNavValue: 10.0000,
        initialInvestors: [
          {
            userId: 1,
            investmentAmount: 10000
          }
        ]
      }),
      mockCurrentUser.id
    );

    // Verify that old fee fields are not included
    const createCall = mockPortfolioService.createPortfolio.calls.mostRecent();
    const payload = createCall.args[0] as CreatePortfolioRequest;

    expect((payload as any).managementFeePercentage).toBeUndefined();
    expect((payload as any).entryLoadPercentage).toBeUndefined();
    expect((payload as any).exitLoadPercentage).toBeUndefined();
    expect((payload as any).brokerageBuyPercentage).toBeUndefined();
    expect((payload as any).brokerageSellPercentage).toBeUndefined();
  });

  it('should handle portfolio creation error', () => {
    spyOn(console, 'error');
    // Initialize component first
    component.ngOnInit();

    // Setup form data
    component.basicInfoForm.patchValue({
      name: 'Test Portfolio',
      description: 'Test Description',
      initialNavValue: 10.0000
    });

    // Add an investor
    component.selectedUserId = 1;
    component.investmentAmount = 10000;
    component.addInvestor();

    // Mock error response
    mockPortfolioService.createPortfolio.and.returnValue(
      throwError(() => ({ error: { error: 'Creation failed' } }))
    );

    component.createPortfolio();

    expect(console.error).toHaveBeenCalledWith('Failed to create portfolio:', jasmine.any(Object));
    expect(component.isCreating).toBe(false);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should validate form correctly', () => {
    // Initially form should be invalid
    expect(component.basicInfoForm.valid).toBe(false);

    // Fill required fields
    component.basicInfoForm.patchValue({
      name: 'Test Portfolio',
      initialNavValue: 10.0000
    });

    expect(component.basicInfoForm.valid).toBe(true);

    // Test minimum NAV validation
    component.basicInfoForm.patchValue({
      initialNavValue: 0
    });

    expect(component.basicInfoForm.get('initialNavValue')?.hasError('min')).toBe(true);
  });

  it('should prevent duplicate investors', () => {
    // Initialize component first
    component.ngOnInit();

    // Add first investor
    component.selectedUserId = 1;
    component.investmentAmount = 10000;
    component.addInvestor();

    expect(component.initialInvestors.length).toBe(1);

    // Try to add same investor again
    component.selectedUserId = 1;
    component.investmentAmount = 5000;
    component.addInvestor();

    // Should still have only one investor
    expect(component.initialInvestors.length).toBe(1);
  });

  it('should not create portfolio without investors', () => {
    // Setup valid basic info but no investors
    component.basicInfoForm.patchValue({
      name: 'Test Portfolio',
      description: 'Test Description',
      initialNavValue: 10.0000
    });

    component.createPortfolio();

    expect(mockPortfolioService.createPortfolio).not.toHaveBeenCalled();
    expect(component.isCreating).toBe(false);
  });
});
