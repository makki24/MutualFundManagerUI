import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StockService } from './stock.service';
import { Stock, StockPrice, BuySharesRequest, BuySharesResponse } from '../models/stock.model';
import { ApiResponse } from '../models/api-response.model';

describe('StockService', () => {
  let service: StockService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://localhost:8080/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StockService]
    });
    service = TestBed.inject(StockService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchStocks', () => {
    it('should search stocks with query parameter', () => {
      const mockStocks: Stock[] = [
        {
          id: '1',
          companyName: 'Reliance Industries Limited',
          industry: 'Oil & Gas',
          sector: 'Energy',
          stockType: 'Equity',
          bseCode: '500325',
          nseCode: 'RELIANCE',
          bseSymbol: 'RELIANCE',
          nseSymbol: 'RELIANCE',
          primarySymbol: 'RELIANCE',
          displayName: 'Reliance Industries Limited'
        }
      ];

      const mockResponse: ApiResponse<Stock[]> = {
        success: true,
        message: 'Stocks retrieved successfully',
        data: mockStocks,
        timestamp: '2025-08-06T16:30:00',
        error: null
      };

      service.searchStocks('RELIANCE').subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data?.length).toBe(1);
        expect(response.data![0].primarySymbol).toBe('RELIANCE');
      });

      const req = httpMock.expectOne(`${API_URL}/stocks/search?q=RELIANCE`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty search results', () => {
      const mockResponse: ApiResponse<Stock[]> = {
        success: true,
        message: 'No stocks found',
        data: [],
        timestamp: '2025-08-06T16:30:00',
        error: null
      };

      service.searchStocks('NONEXISTENT').subscribe(response => {
        expect(response.data?.length).toBe(0);
      });

      const req = httpMock.expectOne(`${API_URL}/stocks/search?q=NONEXISTENT`);
      req.flush(mockResponse);
    });
  });

  describe('getStockPrice', () => {
    it('should get stock price by symbol', () => {
      const mockStockPrice: StockPrice = {
        tickerId: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        industry: 'Oil & Gas',
        currentPrice: {
          bsePrice: '2501.00',
          nsePrice: '2500.75'
        },
        percentChange: 1.25,
        yearHigh: 2856.15,
        yearLow: 2220.30,
        primaryPrice: 2500.75
      };

      const mockResponse: ApiResponse<StockPrice> = {
        success: true,
        message: 'Stock price retrieved successfully',
        data: mockStockPrice,
        timestamp: '2025-08-06T16:30:00',
        error: null
      };

      service.getStockPrice('RELIANCE').subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data!.primaryPrice).toBe(2500.75);
      });

      const req = httpMock.expectOne(`${API_URL}/stocks/RELIANCE/price`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('buyShares', () => {
    it('should buy shares for a portfolio', () => {
      const buyRequest: BuySharesRequest = {
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        quantity: 10,
        price: 2500.00,
        additionalCharges: 100.00,
        description: 'Purchase with additional charges'
      };

      const mockResponse: ApiResponse<BuySharesResponse> = {
        success: true,
        message: 'Shares purchased successfully',
        data: {
          id: 1,
          symbol: 'RELIANCE',
          companyName: 'Reliance Industries Limited',
          quantity: 10,
          buyPrice: 2500.00,
          currentPrice: 2500.00,
          totalInvested: 25000.00,
          currentValue: 25000.00,
          unrealizedGainLoss: 0.00,
          returnPercentage: 0.00,
          lastPriceUpdate: '2025-08-06T16:30:00'
        },
        timestamp: '2025-08-06T16:30:00',
        error: null
      };

      service.buyShares(1, buyRequest, 1).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data!.symbol).toBe('RELIANCE');
      });

      const req = httpMock.expectOne(`${API_URL}/portfolios/1/holdings/buy?adminUserId=1`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(buyRequest);
      req.flush(mockResponse);
    });
  });

  describe('buyMoreShares', () => {
    it('should buy more shares of existing holding', () => {
      const mockResponse: ApiResponse<BuySharesResponse> = {
        success: true,
        message: 'Shares purchased successfully',
        data: {
          id: 1,
          symbol: 'RELIANCE',
          companyName: 'Reliance Industries Limited',
          quantity: 15,
          buyPrice: 2525.00,
          currentPrice: 2500.00,
          totalInvested: 37875.00,
          currentValue: 37500.00,
          unrealizedGainLoss: -375.00,
          returnPercentage: -0.99,
          lastPriceUpdate: '2025-08-06T16:30:00'
        },
        timestamp: '2025-08-06T16:30:00',
        error: null
      };

      service.buyMoreShares(1, 'RELIANCE', 5, 2550.00, 50.00, 1).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data!.quantity).toBe(15);
      });

      const expectedUrl = `${API_URL}/portfolios/1/holdings/symbol/RELIANCE/buy?quantity=5&buyPrice=2550&additionalCharges=50&adminUserId=1`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  
});
