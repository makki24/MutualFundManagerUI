import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TransactionService } from './transaction.service';
import { Transaction, TransactionType, TransactionFilter, TransactionResponse } from '../models/transaction.model';

describe('TransactionService', () => {
  let service: TransactionService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/transactions';

  const mockTransactions: Transaction[] = [
    {
      id: 1,
      portfolioId: 1,
      transactionType: TransactionType.BUY,
      symbol: 'AAPL',
      quantity: 10,
      pricePerUnit: 150,
      totalAmount: 1500,
      createdAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 2,
      portfolioId: 1,
      transactionType: TransactionType.SELL,
      symbol: 'GOOGL',
      quantity: 5,
      pricePerUnit: 2800,
      totalAmount: 14000,
      createdAt: '2024-01-02T10:00:00Z'
    }
  ];

  // Create a mock array with exactly 20 transactions for hasNext testing
  const mock20Transactions: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    portfolioId: 1,
    transactionType: TransactionType.BUY,
    symbol: `STOCK${i + 1}`,
    quantity: 10,
    pricePerUnit: 100 + i,
    totalAmount: (100 + i) * 10,
    createdAt: `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`
  }));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransactionService]
    });
    service = TestBed.inject(TransactionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserTransactions', () => {
    it('should fetch user transactions with pagination headers', () => {
      const userId = 1;
      const filter: TransactionFilter = { page: 0, size: 20 };
      let result: TransactionResponse | undefined;

      service.getUserTransactions(userId, filter).subscribe(response => {
        result = response;
      });

      const req = httpMock.expectOne(`${apiUrl}/user/${userId}?page=0&size=20`);
      expect(req.request.method).toBe('GET');

      // Simulate response with headers
      req.flush({ success: true, message: 'Success', data: mockTransactions }, {
        headers: {
          'X-Total-Count': '50',
          'X-Total-Pages': '3',
          'X-Current-Page': '0',
          'X-Page-Size': '20'
        }
      });

      expect(result).toBeDefined();
      expect(result!.transactions).toEqual(mockTransactions);
      expect(result!.pagination.totalCount).toBe(50);
      expect(result!.pagination.totalPages).toBe(3);
      expect(result!.pagination.currentPage).toBe(0);
      expect(result!.pagination.pageSize).toBe(20);
      expect(result!.pagination.hasNext).toBe(false); // hasNext is calculated based on data.length === 20, mockTransactions has only 2 items
    });

    it('should set hasNext to true when data length equals 20', () => {
      const userId = 1;
      const filter: TransactionFilter = { page: 0, size: 20 };
      let result: TransactionResponse | undefined;

      service.getUserTransactions(userId, filter).subscribe(response => {
        result = response;
      });

      const req = httpMock.expectOne(`${apiUrl}/user/${userId}?page=0&size=20`);
      expect(req.request.method).toBe('GET');

      // Simulate response with exactly 20 transactions
      req.flush({ success: true, message: 'Success', data: mock20Transactions }, {
        headers: {
          'X-Total-Count': '50',
          'X-Total-Pages': '3',
          'X-Current-Page': '0',
          'X-Page-Size': '20'
        }
      });

      expect(result).toBeDefined();
      expect(result!.transactions).toEqual(mock20Transactions);
      expect(result!.pagination.hasNext).toBe(true); // hasNext should be true when data.length === 20
    });

    it('should handle missing pagination headers with defaults', () => {
      const userId = 1;
      const filter: TransactionFilter = { page: 0, size: 20 };
      let result: TransactionResponse | undefined;

      service.getUserTransactions(userId, filter).subscribe(response => {
        result = response;
      });

      const req = httpMock.expectOne(`${apiUrl}/user/${userId}?page=0&size=20`);
      req.flush({ success: true, message: 'Success', data: mockTransactions });

      expect(result).toBeDefined();
      expect(result!.transactions).toEqual(mockTransactions);
      expect(result!.pagination.totalCount).toBe(0);
      expect(result!.pagination.totalPages).toBe(0);
      expect(result!.pagination.currentPage).toBe(0);
      expect(result!.pagination.pageSize).toBe(20);
      expect(result!.pagination.hasNext).toBe(false);
    });

    it('should include filter parameters in request', () => {
      const userId = 1;
      const filter: TransactionFilter = {
        page: 1,
        size: 10,
        type: TransactionType.BUY,
        symbol: 'AAPL',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        portfolioId: 2
      };

      service.getUserTransactions(userId, filter).subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}/user/${userId}?page=1&size=10&type=${TransactionType.BUY}&portfolioId=2&startDate=2024-01-01&endDate=2024-01-31`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'Success', data: [] });
    });

    it('should handle empty filter parameters', () => {
      const userId = 1;
      const filter: TransactionFilter = {};

      service.getUserTransactions(userId, filter).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/user/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'Success', data: [] });
    });
  });

  describe('getPortfolioTransactions', () => {
    it('should fetch portfolio transactions with pagination headers', () => {
      const portfolioId = 1;
      const filter: TransactionFilter = { page: 0, size: 20 };
      let result: TransactionResponse | undefined;

      service.getPortfolioTransactions(portfolioId, filter).subscribe(response => {
        result = response;
      });

      const req = httpMock.expectOne(`${apiUrl}/portfolio/${portfolioId}?page=0&size=20&userNullOnly=true`);
      expect(req.request.method).toBe('GET');

      req.flush({ success: true, message: 'Success', data: mockTransactions }, {
        headers: {
          'X-Total-Count': '100',
          'X-Total-Pages': '5',
          'X-Current-Page': '0',
          'X-Page-Size': '20',
          'X-Has-Next': 'true'
        }
      });

      expect(result).toBeDefined();
      expect(result!.transactions).toEqual(mockTransactions);
      expect(result!.pagination.totalCount).toBe(100);
      expect(result!.pagination.totalPages).toBe(5);
    });

    it('should handle filter parameters for portfolio transactions', () => {
      const portfolioId = 1;
      const filter: TransactionFilter = {
        page: 2,
        size: 30,
        type: TransactionType.DIVIDEND,
        startDate: '2024-02-01',
        endDate: '2024-02-28'
      };

      service.getPortfolioTransactions(portfolioId, filter).subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}/portfolio/${portfolioId}?page=2&size=30&type=${TransactionType.DIVIDEND}&startDate=2024-02-01&endDate=2024-02-28&userNullOnly=true`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'Success', data: [] });
    });
  });

  

  describe('Header Parsing', () => {
    it('should parse boolean header values correctly', () => {
      const portfolioId = 1;
      const filter: TransactionFilter = { page: 0, size: 20 };
      let result: TransactionResponse | undefined;

      service.getPortfolioTransactions(portfolioId, filter).subscribe(response => {
        result = response;
      });

      const req = httpMock.expectOne(`${apiUrl}/portfolio/${portfolioId}?page=0&size=20&userNullOnly=true`);
      
      // Test with string 'false'
      req.flush({ success: true, message: 'Success', data: [] }, {
        headers: {
          'X-Has-Next': 'false'
        }
      });

      expect(result!.pagination.hasNext).toBe(false);
    });

    it('should handle null or undefined header values', () => {
      const portfolioId = 1;
      const filter: TransactionFilter = { page: 0, size: 20 };
      let result: TransactionResponse | undefined;

      service.getPortfolioTransactions(portfolioId, filter).subscribe(response => {
        result = response;
      });

      const req = httpMock.expectOne(`${apiUrl}/portfolio/${portfolioId}?page=0&size=20&userNullOnly=true`);
      
      // Send response without headers
      req.flush({ success: true, message: 'Success', data: [] });

      expect(result!.pagination.totalCount).toBe(0);
      expect(result!.pagination.hasNext).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors for getUserTransactions', () => {
      const userId = 1;
      const filter: TransactionFilter = { page: 0, size: 20 };
      let errorResponse: any;

      service.getUserTransactions(userId, filter).subscribe(
        () => fail('should have failed'),
        error => {
          errorResponse = error;
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/user/${userId}?page=0&size=20`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(errorResponse.status).toBe(500);
    });

    it('should handle HTTP errors for getPortfolioTransactions', () => {
      const portfolioId = 1;
      const filter: TransactionFilter = { page: 0, size: 20 };
      let errorResponse: any;

      service.getPortfolioTransactions(portfolioId, filter).subscribe(
        () => fail('should have failed'),
        error => {
          errorResponse = error;
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/portfolio/${portfolioId}?page=0&size=20&userNullOnly=true`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      expect(errorResponse.status).toBe(404);
    });
  });
});
