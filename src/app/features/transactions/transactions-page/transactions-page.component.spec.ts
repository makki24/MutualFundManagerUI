import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TransactionsPageComponent } from './transactions-page.component';
import { ActivatedRoute } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { of, throwError } from 'rxjs';
import { Portfolio } from '../../../core/models/portfolio.model';
import { TransactionResponse, PaginationHeaders } from '../../../core/models/transaction.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {MatNativeDateModule} from '@angular/material/core';

// Mock TransactionsListComponent
@Component({
  selector: 'app-transactions-list',
  template: '',
  standalone: true
})
class MockTransactionsListComponent {
  @Input() viewType!: 'user' | 'portfolio';
  @Input() portfolioId?: number;
}

describe('TransactionsPageComponent', () => {
  let component: TransactionsPageComponent;
  let fixture: ComponentFixture<TransactionsPageComponent>;
  let mockPortfolioService: jasmine.SpyObj<PortfolioService>;
  let mockTransactionService: jasmine.SpyObj<TransactionService>;
  let mockActivatedRoute: any;

  const mockPortfolio: Portfolio = {
    id: 1,
    name: 'Tech Portfolio',
    navValue: 100000,
    totalAum: 1000000,
    totalUnits: 10000,
    remainingCash: 50000,
    totalInvestors: 5,
    totalHoldings: 10,
    createdBy: { id: 1, username: 'admin' },
    createdAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    // Create spies for services
    mockPortfolioService = jasmine.createSpyObj('PortfolioService', ['getPortfolioDetails']);
    mockTransactionService = jasmine.createSpyObj('TransactionService', ['getUserTransactions', 'getPortfolioTransactions']);

    // Setup default mock responses with proper types
    const mockApiResponse = {
      success: true,
      data: mockPortfolio,
      message: 'Success',
      timestamp: new Date().toISOString(),
      error: null
    };

    mockPortfolioService.getPortfolioDetails.and.returnValue(of(mockApiResponse));

    // Create a properly typed empty pagination object
    const emptyPagination: PaginationHeaders = {
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
      hasNext: false
    };

    // Create a properly typed empty transaction response
    const emptyTransactionResponse: TransactionResponse = {
      transactions: [],
      pagination: emptyPagination
    };

    // Setup mock service responses
    mockTransactionService.getUserTransactions.and.returnValue(of(emptyTransactionResponse));
    mockTransactionService.getPortfolioTransactions.and.returnValue(of(emptyTransactionResponse));

    mockActivatedRoute = {
      params: of({}),
      queryParams: of({}),
      snapshot: {}
    };

    await TestBed.configureTestingModule({
      imports: [
        TransactionsPageComponent,
        NoopAnimationsModule,
        HttpClientTestingModule,
        MatNativeDateModule
      ],
      providers: [
        { provide: PortfolioService, useValue: mockPortfolioService },
        { provide: TransactionService, useValue: mockTransactionService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .overrideComponent(TransactionsPageComponent, {
      set: { template: '<div></div>' }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.portfolioId).toBeUndefined();
      expect(component.portfolio).toBeUndefined();
      expect(component.selectedTabIndex).toBe(0);
    });

    it('should load portfolio details when portfolioId is in route params', () => {
      mockActivatedRoute.params = of({ portfolioId: '1' });
      const mockApiResponse = {
        success: true,
        data: mockPortfolio,
        message: 'Success',
        timestamp: new Date().toISOString(),
        error: null
      };
      mockPortfolioService.getPortfolioDetails.and.returnValue(of(mockApiResponse));

      component.ngOnInit();

      expect(component.portfolioId).toBe(1);
      expect(component.portfolio).toEqual(mockPortfolio);
      expect(component.selectedTabIndex).toBe(1);
      expect(mockPortfolioService.getPortfolioDetails).toHaveBeenCalledWith(1);
    });

    it('should handle undefined data in portfolio response', () => {
      mockActivatedRoute.params = of({ portfolioId: '1' });
      mockPortfolioService.getPortfolioDetails.and.returnValue(
        of({ success: true, data: undefined as any, message: 'Success', timestamp: new Date().toISOString(), error: null })
      );

      component.ngOnInit();

      expect(component.portfolio).toBeUndefined();
    });
  });

  describe('Query Parameters', () => {
    it('should set tab to portfolio when view query param is portfolio', () => {
      mockActivatedRoute.queryParams = of({ view: 'portfolio' });
      component.ngOnInit();
      expect(component.selectedTabIndex).toBe(1);
    });

    it('should set tab to user when view query param is user', () => {
      mockActivatedRoute.queryParams = of({ view: 'user' });
      component.ngOnInit();
      expect(component.selectedTabIndex).toBe(0);
    });
  });

  describe('Portfolio Loading', () => {
    it('should call loadPortfolioDetails when portfolioId exists', () => {
      spyOn<any>(component, 'loadPortfolioDetails');
      mockActivatedRoute.params = of({ portfolioId: '2' });
      component.ngOnInit();
      expect(component['loadPortfolioDetails']).toHaveBeenCalled();
      expect(component.portfolioId).toBe(2);
    });
  });
});
