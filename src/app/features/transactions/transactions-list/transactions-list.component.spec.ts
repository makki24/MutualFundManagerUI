import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatNativeDateModule } from '@angular/material/core';
import { TransactionsListComponent } from './transactions-list.component';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { of, throwError, Subject } from 'rxjs';
import { Transaction, TransactionType, TransactionResponse, PaginationHeaders } from '../../../core/models/transaction.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ElementRef } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { InvestmentService } from '../../../core/services/investment.service';

describe('TransactionsListComponent', () => {
  let component: TransactionsListComponent;
  let fixture: ComponentFixture<TransactionsListComponent>;
  let mockTransactionService: jasmine.SpyObj<TransactionService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockInvestmentService: jasmine.SpyObj<InvestmentService>;

  const mockPaginationHeaders: PaginationHeaders = {
    totalCount: 50,
    totalPages: 3,
    currentPage: 0,
    pageSize: 20,
    hasNext: true
  };

  const mockTransactions: Transaction[] = [
    {
      id: 1,
      portfolioId: 1,
      transactionType: TransactionType.BUY,
      symbol: 'AAPL',
      quantity: 10,
      pricePerUnit: 150,
      totalAmount: 1500,
      createdAt: '2024-01-01T10:00:00Z',
      portfolio: { id: 1, name: 'Tech Portfolio' }
    },
    {
      id: 2,
      portfolioId: 1,
      transactionType: TransactionType.SELL,
      symbol: 'GOOGL',
      quantity: 5,
      pricePerUnit: 2800,
      totalAmount: 14000,
      createdAt: '2024-01-02T10:00:00Z',
      portfolio: { id: 1, name: 'Tech Portfolio' }
    }
  ];

  const mockTransactionResponse: TransactionResponse = {
    transactions: mockTransactions,
    pagination: mockPaginationHeaders
  };

  beforeEach(async () => {
    mockTransactionService = jasmine.createSpyObj('TransactionService', [
      'getUserTransactions',
      'getPortfolioTransactions'
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);
    mockInvestmentService = jasmine.createSpyObj('InvestmentService', [
      'getUserInvestments',
      'getPortfolioInvestments',
      'getUserInvestmentSummary',
      'investInPortfolio',
      'withdrawFromPortfolio'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        TransactionsListComponent, 
        NoopAnimationsModule,
        MatNativeDateModule,
        RouterTestingModule
      ],
      providers: [
        { provide: TransactionService, useValue: mockTransactionService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: InvestmentService, useValue: mockInvestmentService },
        provideNativeDateAdapter()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsListComponent);
    component = fixture.componentInstance;
    
    // Mock the scroll container
    component.scrollContainer = {
      nativeElement: document.createElement('div')
    } as ElementRef;

    // Default: avoid undefined subscribe when portfolio view triggers user load
    mockInvestmentService.getPortfolioInvestments.and.returnValue(
      of({
        success: true,
        message: '',
        data: [],
        timestamp: new Date().toISOString(),
        error: null
      })
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.transactions).toEqual([]);
      expect(component.currentPage).toBe(0);
      expect(component.pageSize).toBe(20);
      expect(component.hasMorePages).toBe(true);
      expect(component.isLoading).toBe(false);
      expect(component.isLoadingMore).toBe(false);
    });

    it('should remove portfolio column when viewType is portfolio', () => {
      component.viewType = 'portfolio';
      component.portfolioId = 1;
      mockTransactionService.getPortfolioTransactions.and.returnValue(of(mockTransactionResponse));
      
      component.ngOnInit();
      
      expect(component.displayedColumns).not.toContain('portfolio');
    });

    it('should not include portfolio column when viewType is user', () => {
      component.viewType = 'user';
      mockAuthService.getCurrentUserId.and.returnValue(1);
      mockTransactionService.getUserTransactions.and.returnValue(of(mockTransactionResponse));
      
      component.ngOnInit();
      
      expect(component.displayedColumns).not.toContain('portfolio');
    });
  });

  describe('Loading Transactions', () => {
    it('should load user transactions successfully', () => {
      component.viewType = 'user';
      mockAuthService.getCurrentUserId.and.returnValue(1);
      mockTransactionService.getUserTransactions.and.returnValue(of(mockTransactionResponse));

      component.loadTransactions();

      expect(component.isLoading).toBe(false);
      expect(component.transactions).toEqual(mockTransactions);
      expect(component.totalCount).toBe(50);
      expect(component.totalPages).toBe(3);
      expect(component.hasMorePages).toBe(true);
    });

    it('should load portfolio transactions successfully', () => {
      component.viewType = 'portfolio';
      component.portfolioId = 1;
      mockTransactionService.getPortfolioTransactions.and.returnValue(of(mockTransactionResponse));

      component.loadTransactions();

      expect(mockTransactionService.getPortfolioTransactions).toHaveBeenCalledWith(1, jasmine.any(Object));
      expect(component.transactions).toEqual(mockTransactions);
      expect(component.isLoading).toBe(false);
    });

    it('should handle error when loading transactions', () => {
      component.viewType = 'user';
      mockAuthService.getCurrentUserId.and.returnValue(1);
      mockTransactionService.getUserTransactions.and.returnValue(
        throwError(() => new Error('Failed to load'))
      );
      spyOn(console, 'error');

      component.loadTransactions();

      expect(console.error).toHaveBeenCalledWith('Error loading transactions:', jasmine.any(Error));
      expect(component.isLoading).toBe(false);
    });

    it('should throw error when user ID is not found', () => {
      component.viewType = 'user';
      mockAuthService.getCurrentUserId.and.returnValue(null);

      expect(() => component.loadTransactions()).toThrow();
    });
  });

  describe('Infinite Scroll', () => {
    it('should load more transactions when scrolling near bottom', fakeAsync(() => {
      component.viewType = 'user';
      component.hasMorePages = true;
      component.isLoadingMore = false;
      mockAuthService.getCurrentUserId.and.returnValue(1);
      
      // Setup initial transactions
      const initialResponse: TransactionResponse = {
        transactions: [...mockTransactions], // Make a copy of the initial transactions
        pagination: { ...mockPaginationHeaders, currentPage: 0, hasNext: true }
      };
      
      // Setup additional transactions to be loaded
      const moreTransactions: Transaction[] = [{
        id: 3,
        portfolioId: 1,
        transactionType: TransactionType.DIVIDEND,
        symbol: 'MSFT',
        totalAmount: 500,
        pricePerUnit: 250,
        quantity: 2,
        createdAt: '2024-01-03T10:00:00Z',
        portfolio: { id: 1, name: 'Tech Portfolio' }
      }];
      
      const moreResponse: TransactionResponse = {
        transactions: moreTransactions,
        pagination: { ...mockPaginationHeaders, currentPage: 1, hasNext: false }
      };
      
      // Setup mock to return initial response first, then more response
      let callCount = 0;
      mockTransactionService.getUserTransactions.and.callFake(() => {
        return callCount++ === 0 ? of(initialResponse) : of(moreResponse);
      });

      // Simulate scroll event
      const scrollElement = component.scrollContainer.nativeElement;
      Object.defineProperty(scrollElement, 'scrollTop', { value: 900, writable: true });
      Object.defineProperty(scrollElement, 'scrollHeight', { value: 1000, writable: true });
      Object.defineProperty(scrollElement, 'clientHeight', { value: 200, writable: true });

      // Initial load
      component.ngOnInit();
      tick();
      
      // Trigger load more
      component['loadMoreTransactions']();
      tick();

      // Verify results
      expect(component.transactions.length).toBe(3); // 2 initial + 1 more
      expect(component.currentPage).toBe(1);
      expect(component.hasMorePages).toBeFalse(); // No more pages after this
    }));

    it('should not load more when already loading', () => {
      component.isLoadingMore = true;
      component.hasMorePages = true;
      mockAuthService.getCurrentUserId.and.returnValue(1);

      const initialCallCount = mockTransactionService.getUserTransactions.calls.count();
      component['loadMoreTransactions']();

      expect(mockTransactionService.getUserTransactions.calls.count()).toBe(initialCallCount);
    });

    it('should not load more when no more pages', () => {
      component.hasMorePages = false;
      component.isLoadingMore = false;

      const initialCallCount = mockTransactionService.getUserTransactions.calls.count();
      component['loadMoreTransactions']();

      expect(mockTransactionService.getUserTransactions.calls.count()).toBe(initialCallCount);
    });

    it('should handle error when loading more transactions', () => {
      component.viewType = 'user';
      component.hasMorePages = true;
      component.isLoadingMore = false;
      component.currentPage = 0;
      mockAuthService.getCurrentUserId.and.returnValue(1);
      mockTransactionService.getUserTransactions.and.returnValue(
        throwError(() => new Error('Failed to load more'))
      );
      spyOn(console, 'error');

      component['loadMoreTransactions']();

      expect(console.error).toHaveBeenCalledWith('Error loading more transactions:', jasmine.any(Error));
      expect(component.currentPage).toBe(0); // Should revert page increment
      expect(component.isLoadingMore).toBe(false);
    });
  });

  describe('Filters', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUserId.and.returnValue(1);
      mockTransactionService.getUserTransactions.and.returnValue(of(mockTransactionResponse));
    });

    it('should apply filters correctly', () => {
      component.selectedType = TransactionType.BUY;
      component.selectedSymbol = 'AAPL';
      component.startDate = new Date('2024-01-01');
      component.endDate = new Date('2024-01-31');

      component.applyFilters();

      expect(component.filter.type).toBe(TransactionType.BUY);
      expect(component.filter.symbol).toBe('AAPL');
      expect(component.filter.startDate).toBeDefined();
      expect(component.filter.endDate).toBeDefined();
      expect(component.currentPage).toBe(0);
    });

    it('should clear filters correctly', () => {
      component.selectedType = TransactionType.BUY;
      component.selectedSymbol = 'AAPL';
      component.startDate = new Date();
      component.endDate = new Date();
      component.portfolioId = 1;
      component.viewType = 'user';

      component.clearFilters();

      expect(component.selectedType).toBeUndefined();
      expect(component.selectedSymbol).toBeUndefined();
      expect(component.startDate).toBeUndefined();
      expect(component.endDate).toBeUndefined();
      expect(component.filter.portfolioId).toBe(1);
    });

    it('should reset filter when clearing without portfolio', () => {
      component.selectedType = TransactionType.SELL;
      component.viewType = 'portfolio';

      component.clearFilters();

      expect(component.filter).toEqual({
        page: 0,
        size: component.pageSize
      });
    });
  });

  describe('Utility Methods', () => {
    it('should return correct color for transaction types', () => {
      expect(component.getTransactionTypeColor(TransactionType.BUY)).toBe('primary');
      expect(component.getTransactionTypeColor(TransactionType.SELL)).toBe('accent');
      expect(component.getTransactionTypeColor(TransactionType.DIVIDEND)).toBe('accent');
      expect(component.getTransactionTypeColor(TransactionType.FEE)).toBe('warn');
      expect(component.getTransactionTypeColor(TransactionType.INVESTMENT)).toBe('primary');
      expect(component.getTransactionTypeColor(TransactionType.WITHDRAWAL)).toBe('accent');
    });

    it('should format date correctly', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const formatted = component.formatDate(dateString);
      
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });

  describe('Component Cleanup', () => {
    it('should unsubscribe on destroy', () => {
      const destroySpy = spyOn(component['destroy$'], 'next');
      const completespy = spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completespy).toHaveBeenCalled();
    });
  });
});
